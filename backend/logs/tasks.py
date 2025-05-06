from celery import shared_task
from django.conf import settings
from .models import Call
import time

@shared_task
def sync_call_recordings():
    """
    Celery task to synchronize call recordings from the configured directory.
    """
    directory_path = settings.CALL_RECORDINGS_DIR  # Ensure this is set in settings.py
    
    start_time = time.time()
    persons_created, recordings_created, skipped_files = Call.sync_recordings(directory_path)
    duration = time.time() - start_time
    
    return {
        'status': 'completed',
        'persons_created': persons_created,
        'recordings_created': recordings_created,
        'skipped_files': skipped_files,
        'duration_seconds': duration,
    }
