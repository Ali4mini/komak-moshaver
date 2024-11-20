# Use the official Python image
FROM python:3.12 AS base

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
  PYTHONUNBUFFERED=1 \
  PYTHONFAULTHANDLER=1 \
  PYTHONHASHSEED=random \
  PIP_NO_CACHE_DIR=off \
  PIP_DISABLE_PIP_VERSION_CHECK=on \
  PIP_DEFAULT_TIMEOUT=100 \
  POETRY_VERSION=1.8.4 

# Install Poetry using pip
RUN pip install --no-cache-dir poetry==${POETRY_VERSION}

# Ensure Poetry is in the PATH
ENV PATH="/root/.local/bin:$PATH"

WORKDIR /app

# Copy dependency files first to leverage Docker caching
COPY pyproject.toml poetry.lock /app/

# Project initialization
RUN poetry config virtualenvs.create false && \
  poetry install --no-interaction --no-ansi --no-dev

# Development Stage
FROM base AS dev
COPY . /app/
EXPOSE 8000
CMD ["poetry", "run", "python", "manage.py", "runserver", "0.0.0.0:8000"]

# Production Stage
FROM base AS prod
COPY . /app/
EXPOSE 8000
CMD ["poetry", "run", "gunicorn", "--bind", "0.0.0.0:8000", "amlak.wsgi:application"]
