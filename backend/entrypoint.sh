#!/bin/sh
set -e

echo "Collecting static files..."
python manage.py collectstatic --no-input

echo "Applying database migrations..."
python manage.py migrate

echo "Starting Gunicorn server..."
exec gunicorn --bind 0.0.0.0:8000 amlak.wsgi:application
