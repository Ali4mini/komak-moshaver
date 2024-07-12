# Use an official Python runtime as a parent image
FROM python:3.12

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Set work directory
WORKDIR /app

# Copy the current directory contents into the container at /app
COPY . /app/

# Install any needed packages specified in requirements.txt
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Make port 8000 available to the world outside this container
EXPOSE 8000

# Define environment variable
ENV DEBUG ON \
  DB_NAME=amlak \
  DB_HOST=localhost \
  DB_PASS=amlak \
  DB_USER=amlak \
  DB_PORT=5432 \
  LIARA_ENDPOINT=https://storage.iran.liara.space \
  LIARA_BUCKET_NAME=komak-moshaver-cdn

EXPOSE 8000

# Run app.py when the container launches
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]
