import os
import re
import json
import requests
from pathlib import Path
from datetime import datetime
from django.core.management.base import BaseCommand
from django.core.files import File
from django.conf import settings
from logs.models import Call
from utils.models import Person

class Command(BaseCommand):
    help = 'Process call recordings directory and create Call instances'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--directory',
            type=str,
            help='Path to the call recordings directory',
            default=settings.CALL_RECORDINGS_DIR
        )
        parser.add_argument(
            '--delete',
            action='store_true',
            help='Delete processed files after import'
        )
        parser.add_argument(
            '--skip-transcribe',
            action='store_true',
            help='Skip transcription of recordings'
        )
    
    def handle(self, *args, **options):
        directory_path = options['directory']
        delete_after = options['delete']
        skip_transcribe = options['skip_transcribe']
        
        self.stdout.write(f"Processing call recordings in {directory_path}")
        
        stats = {
            'persons_created': 0,
            'recordings_created': 0,
            'skipped_files': 0,
            'errors': 0
        }
        
        # Get already imported files
        imported_files = set(
            os.path.basename(rec.recording_file.name)
            for rec in Call.objects.exclude(recording_file='')
            if rec.recording_file
        )
        
        for filename in os.listdir(directory_path):
            if not filename.endswith('.m4a') or filename in imported_files:
                stats['skipped_files'] += 1
                continue
                
            recording_path = os.path.join(directory_path, filename)
            
            try:
                recording = self.process_recording_file(recording_path, skip_transcribe)
                if recording:
                    stats['recordings_created'] += 1
                    if recording.person.pk is None:  # New person created
                        stats['persons_created'] += 1
                    
                    if delete_after:
                        try:
                            os.remove(recording_path)
                            # Also delete corresponding metadata file if exists
                            props_file = self.get_props_file_path(recording_path)
                            if os.path.exists(props_file):
                                os.remove(props_file)
                        except OSError as e:
                            self.stdout.write(self.style.ERROR(
                                f"Failed to delete {recording_path}: {e}"
                            ))
            except Exception as e:
                stats['errors'] += 1
                self.stdout.write(self.style.ERROR(
                    f"Failed to process {filename}: {e}"
                ))
        
        # Print summary
        self.stdout.write(self.style.SUCCESS(
            f"Processing complete. Results:\n"
            f"- New persons created: {stats['persons_created']}\n"
            f"- Call recordings created: {stats['recordings_created']}\n"
            f"- Files skipped: {stats['skipped_files']}\n"
            f"- Errors encountered: {stats['errors']}"
        ))
    
    def get_props_file_path(self, recording_path):
        """Get path to corresponding metadata file in .props directory"""
        props_dir = os.path.join(os.path.dirname(recording_path), '.props')
        filename = Path(recording_path).stem + '.json'
        return os.path.join(props_dir, filename)
    
    def parse_recording_filename(self, filename):
        """
        Extract phone number and date from recording filename.
        Returns tuple of (phone_number, datetime) or None if parsing fails.
        """
        pattern = re.compile(
            r'^.*?_'  # Prefix (like 'phone_')
            r'(\d{8})-'  # Date (YYYYMMDD)
            r'\d{6}_'  # Time (HHMMSS)
            r'_?'  # Optional extra underscore
            r'(\d+)'  # Phone number (may start with 0 or after underscore)
            r'\.m4a$',  # Extension
            re.IGNORECASE
        )
        
        match = pattern.match(filename)
        if not match:
            return None
            
        date_str, phone_number = match.groups()
        try:
            call_date = datetime.strptime(date_str, '%Y%m%d')
            return phone_number, call_date
        except ValueError:
            return None
    
    def get_recording_metadata(self, recording_path):
        """Extract metadata from corresponding JSON file in .props directory."""
        try:
            props_file = self.get_props_file_path(recording_path)
            
            with open(props_file, 'r') as f:
                data = json.load(f)
                
                metadata = {
                    'duration': int(data.get('duration', 0)) // 1000,  # ms to seconds
                    'direction': data.get('direction'),
                    'callee': data.get('callee'),
                }
                
                # Parse location as JSON if available
                if 'loc' in data:
                    try:
                        lat, lon = map(float, data['loc'].split(';'))
                        metadata['location'] = {
                            'latitude': lat,
                            'longitude': lon,
                            'type': 'Point'
                        }
                    except (ValueError, AttributeError):
                        pass
                        
                return metadata
        except (FileNotFoundError, json.JSONDecodeError, KeyError) as e:
            self.stdout.write(self.style.WARNING(
                f"Metadata error for {recording_path}: {e}"
            ))
            return None
    
    def process_recording_file(self, recording_path, skip_transcribe=False):
        """Process a single recording file and create Call instance."""
        filename = os.path.basename(recording_path)
        
        # Parse filename
        filename_data = self.parse_recording_filename(filename)
        if not filename_data:
            self.stdout.write(self.style.WARNING(
                f"Invalid filename format: {filename}"
            ))
            return None
            
        phone_number, call_date = filename_data
        
        # Get metadata
        metadata = self.get_recording_metadata(recording_path)
        
        # Find or create person
        person, created = Person.objects.get_or_create(
            phone_number=phone_number,
            defaults={
                'first_name': 'Unknown',
                'last_name': f'Caller ({phone_number})',
                'gender': None
            }
        )
        
        # Create call instance
        call = Call(
            person=person,
            phone_number=phone_number,
            start_time=call_date,
            end_time=call_date,
            call_type=Call.CallType.OUTGOING if metadata and metadata.get('direction') == 'Outgoing' 
                      else Call.CallType.INCOMING,
            call_status=Call.CallStatus.COMPLETED,
            duration=metadata.get('duration') if metadata else None,
            location=metadata.get('location') if metadata else None
        )
        
        # Save the file
        with open(recording_path, 'rb') as f:
            call.recording_file.save(filename, File(f))
        
        # Optionally transcribe
        if not skip_transcribe and call.recording_file and not call.recording_transcription:
            call.recording_transcription = self.get_recording_transcription(call.recording_file.name)
        
        call.save()
        return call
    
    def get_recording_transcription(self, recording_file):
        """Get transcription from ASR server via HTTP API"""
        # Construct full file path
        file_path = os.path.join(settings.MEDIA_ROOT, recording_file)
        
        # Verify file exists
        if not os.path.exists(file_path):
            self.stdout.write(self.style.WARNING(
                f"File not found: {file_path}"
            ))
            return ""
        
        try:
            # Send to ASR server
            response = requests.post(
                'http://localhost:8188/transcribe',
                json={"file_path": file_path},
            )
            
            # Handle response
            if response.status_code == 200:
                result = response.json()
                return result.get("transcription", "")
            else:
                self.stdout.write(self.style.ERROR(
                    f"Server error: {response.status_code} - {response.text}"
                ))
                return f"Error: {response.text}"
                
        except requests.exceptions.RequestException as e:
            self.stdout.write(self.style.ERROR(
                f"Transcription request failed: {str(e)}"
            ))
            return f"Transcription failed: {str(e)}"
