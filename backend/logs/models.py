from django.db import models
from file.models import Sell, Rent
from customer.models import BuyCustomer, RentCustomer
from django.conf import settings
from datetime import datetime
from utils.models import Person
from typing import Optional, Tuple, Dict
from django.core.files import File
from pathlib import Path
from AI.ASR.core import transcriber
import os
import re
import json


class Call(models.Model):
    class CallType(models.TextChoices):
        INCOMING = "IN", "Incoming"
        OUTGOING = "OUT", "Outgoing"
        MISSED = "MISS", "Missed"
    
    class CallStatus(models.TextChoices):
        COMPLETED = "COMP", "Completed"
        FAILED = "FAIL", "Failed"
        NO_ANSWER = "NOANS", "No Answer"
        BUSY = "BUSY", "Busy"

    # Core Fields
    person = models.ForeignKey(
        Person,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='call_recordings'
    )
    phone_number = models.CharField(max_length=20, db_index=True)
    call_id = models.CharField(max_length=100, unique=True, blank=True, null=True)
    
    
    # Call Metadata
    call_type = models.CharField(
        max_length=4,
        choices=CallType.choices,
        default=CallType.INCOMING
    )
    call_status = models.CharField(
        max_length=5,
        choices=CallStatus.choices,
        default=CallStatus.COMPLETED
    )
    start_time = models.DateTimeField()
    end_time = models.DateTimeField()
    duration = models.PositiveIntegerField(null=True, blank=True)  # in seconds
    location = models.JSONField(null=True, blank=True)  # Changed from PointField to JSONField
    
    # Recording File
    recording_file = models.FileField(
        upload_to='call_recordings/%Y/%m/%d/',
        blank=True,
        null=True
    )
    recording_url = models.URLField(
        'Recording URL',
        blank=True,
        null=True
    )
    recording_transcription = models.TextField(blank=True)
    
    agent = models.ForeignKey(
        'auth.User',  
        on_delete=models.SET_NULL,
        verbose_name='Handling Agent',
        null=True,
        blank=True
    )
    # System Fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-start_time']
        indexes = [
            models.Index(fields=['phone_number', 'start_time']),
            models.Index(fields=['person', 'start_time']),
        ]

    def __str__(self):
        return f"Call with {self.phone_number} at {self.start_time}"


    @staticmethod
    def parse_recording_filename(filename: str) -> Optional[Tuple[str, datetime]]:
        """
        Extract phone number and date from recording filename.
        Handles two formats:
        1. phone_YYYYMMDD-HHMMSS_0XXXXXXXXXX.m4a
        2. phone_YYYYMMDD-HHMMSS__XXXXXXXXXX.m4a (with double underscore before phone number)
        
        Returns:
            Tuple of (phone_number, datetime) or None if parsing fails
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

    @classmethod
    def get_recording_metadata(cls, recording_path: str) -> Optional[Dict]:
        """Extract metadata from corresponding JSON file in .props directory."""
        try:
            props_dir = os.path.join(os.path.dirname(recording_path), '.props')
            filename = Path(recording_path).stem + '.json'
            props_path = os.path.join(props_dir, filename)
            
            with open(props_path, 'r') as f:
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
            print(f"Metadata error for {recording_path}: {e}")
            return None

    @classmethod
    def create_from_file(cls, recording_path: str) -> Optional['CallRecording']:
        """Create a CallRecording instance from file path with metadata."""
        filename = os.path.basename(recording_path)
        
        # Parse filename
        filename_data = cls.parse_recording_filename(filename)
        if not filename_data:
            print(f"Invalid filename format: {filename}")
            return None
            
        phone_number, call_date = filename_data
        
        # Get metadata
        metadata = cls.get_recording_metadata(recording_path)
        
        # Find or create person
        person, _ = Person.objects.get_or_create(
            phone_number=phone_number,
            defaults={
                'first_name': 'Unknown',
                'last_name': f'Caller ({phone_number})',
                'gender': None
            }
        )
        
        # Create recording instance
        recording = cls(
            person=person,
            phone_number=phone_number,
            start_time=call_date,
            end_time=call_date,
            call_type=cls.CallType.OUTGOING if metadata and metadata.get('direction') == 'Outgoing' 
                      else cls.CallType.INCOMING,
            call_status=cls.CallStatus.COMPLETED,
            duration=metadata.get('duration') if metadata else None,
            location=metadata.get('location') if metadata else None
        )
        
        # Save the file
        with open(recording_path, 'rb') as f:
            recording.recording_file.save(filename, File(f))
        
        return recording

    @classmethod
    def sync_recordings(cls, directory_path: str) -> Tuple[int, int, int]:
        """Synchronize recordings from directory."""
        persons_created = 0
        recordings_created = 0
        skipped_files = 0

        #TODO: handling agent
        # # handling agent
        # directory_list = directory_path.split("/")
        # agent_name = directory_list[-2]
        # print(agent_name)

        
        # Get already imported files
        imported_files = set(
            os.path.basename(rec.recording_file.name)
            for rec in cls.objects.exclude(recording_file='')
            if rec.recording_file
        )
        
        for filename in os.listdir(directory_path):
            if not filename.endswith('.m4a') or filename in imported_files:
                skipped_files += 1
                continue
                
            recording_path = os.path.join(directory_path, filename)
            
            try:
                recording = cls.create_from_file(recording_path)
                if recording:
                    recordings_created += 1
                    if recording.person.pk is None:  # New person created
                        persons_created += 1
            except Exception as e:
                print(f"Failed to process {filename}: {e}")
                skipped_files += 1
                
        return persons_created, recordings_created, skipped_files

    def get_recording_transcription(self, recording_file):
        """Get transcription for the recording file."""
        # Get the full path to the file
        file_path = os.path.join(settings.MEDIA_ROOT, recording_file.name)
        
        # Check if file exists
        if not os.path.exists(file_path):
            return ""
            
        # Use the transcriber to get the text
        return transcriber.transcribe(file_path)
    
    def save(self, *args, **kwargs):
        """Ensure required fields are populated before saving."""
        if not self.phone_number:
            if self.person:
                self.phone_number = self.person.phone_number
            elif self.recording_file:
                result = self.parse_recording_filename(self.recording_file.name)
                if result:
                    self.phone_number = result[0]
        
        if self.start_time and self.end_time and not self.duration:
            self.duration = (self.end_time - self.start_time).seconds

        # Only transcribe if we have a recording file and no existing transcription
        if self.recording_file and not self.recording_transcription:
            self.recording_transcription = self.get_recording_transcription(self.recording_file) 
            
        super().save(*args, **kwargs)

    def get_location_coords(self) -> Optional[Tuple[float, float]]:
        """Helper method to get location as (lat, lon) tuple."""
        if self.location and 'latitude' in self.location and 'longitude' in self.location:
            return (self.location['latitude'], self.location['longitude'])
        return None

# Create your models here.
class SellCall(models.Model):
    class Subjects(models.TextChoices):
        PEYGIRI = "P", "پیگیری"
        MOAREFI = "M", "معرفی"

    file = models.ForeignKey(Sell, on_delete=models.DO_NOTHING)
    customer = models.ForeignKey(BuyCustomer, on_delete=models.DO_NOTHING)
    subject = models.CharField(max_length=2, choices=Subjects.choices)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("added to site by "),
        on_delete=models.DO_NOTHING,
        blank=False,
    )
    description = models.CharField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return f"customer {self.customer} on file {self.file}"


class RentCall(models.Model):
    class Subjects(models.TextChoices):
        PEYGIRI = "P", "پیگیری"
        MOAREFI = "M", "معرفی"

    file = models.ForeignKey(Rent, on_delete=models.DO_NOTHING)
    customer = models.ForeignKey(RentCustomer, on_delete=models.DO_NOTHING)
    subject = models.CharField(max_length=2, choices=Subjects.choices)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("added to site by "),
        on_delete=models.DO_NOTHING,
        blank=False,
    )
    description = models.CharField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return f"customer {self.customer} on file {self.file}"


class RentTour(models.Model):
    class Type(models.TextChoices):
        POST = "P", "پس"
        HAMRAH = "H", "همراه"

    file = models.ForeignKey(Rent, on_delete=models.DO_NOTHING)
    customer = models.ForeignKey(RentCustomer, on_delete=models.DO_NOTHING)
    tour_type = models.CharField(max_length=2, choices=Type.choices)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("added to site by "),
        on_delete=models.DO_NOTHING,
        blank=False,
    )
    description = models.CharField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return f"customer {self.customer} on file {self.file}"


class SellTour(models.Model):
    class Type(models.TextChoices):
        POST = "P", "پس"
        HAMRAH = "H", "همراه"

    file = models.ForeignKey(Sell, on_delete=models.DO_NOTHING)
    customer = models.ForeignKey(BuyCustomer, on_delete=models.DO_NOTHING)
    tour_type = models.CharField(max_length=2, choices=Type.choices)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    added_by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        verbose_name=("added to site by "),
        on_delete=models.DO_NOTHING,
        blank=False,
    )
    description = models.CharField(max_length=1000, blank=True, null=True)

    def __str__(self):
        return f"customer {self.customer} on file {self.file}"


class SMSLog(models.Model):
    task_id = models.CharField(max_length=255, unique=True)
    status = models.BooleanField()
    message = models.TextField()
    phone_number = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Task {self.task_id}: {self.status}"

    def resend_sms(self):
        from file.tasks import resend_message

        resend_message.delay(self.phone_number, self.message)
