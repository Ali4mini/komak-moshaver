import os

from celery import Celery

# Set the default Django settings module for the 'celery' program.
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "amlak.settings")

app = Celery("amlak")

# Using a string here means the worker doesn't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object("django.conf:settings", namespace="CELERY")

# Load task modules from all registered Django apps.
app.autodiscover_tasks()

# Configure the broker and result backend
app.conf.broker_url = "redis://localhost:6379/0"  # Redis as the broker
app.conf.result_backend = "redis://localhost:6379/0"  # Redis for storing results
app.conf.accept_content = ["json"]  # Accept only JSON content
app.conf.task_serializer = "json"  # Use JSON for task serialization
app.conf.result_serializer = "json"  # Use JSON for result serialization


@app.task(bind=True, ignore_result=True)
def debug_task(self):
    print(f"Request: {self.request!r}")
