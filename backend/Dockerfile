# Use the official Python image
FROM docker.arvancloud.ir/python:3.12-slim-bullseye AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PYTHONFAULTHANDLER=1 \
    PYTHONHASHSEED=random \
    PIP_NO_CACHE_DIR=off \
    PIP_DISABLE_PIP_VERSION_CHECK=on \
    PIP_DEFAULT_TIMEOUT=100 \
    POETRY_VERSION=1.8.4

# Install system dependencies and Poetry
RUN pip install --no-cache-dir poetry==${POETRY_VERSION}

WORKDIR /app

# Copy dependency files first to leverage Docker caching
COPY pyproject.toml poetry.lock /app/


# Copy the rest of the application
COPY . /app/

# Development Stage
FROM base AS dev
RUN poetry install --no-interaction --no-ansi
EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]

# Production Stage
FROM base AS prod
EXPOSE 8000
# Install project dependencies
RUN poetry config virtualenvs.create false && \
    poetry install --no-interaction --no-ansi --only main
CMD ["gunicorn", "--bind", "0.0.0.0:8000", "amlak.wsgi:application"]
