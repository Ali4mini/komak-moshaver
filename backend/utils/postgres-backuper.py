import os
import subprocess
import sys
import logging
from datetime import datetime


def setup_logging():
    # Create a logger
    logger = logging.getLogger("PostgresBackup")
    logger.setLevel(logging.DEBUG)

    # Create file handler to log messages to a file
    log_file_handler = logging.FileHandler("backup_postgres.log")
    log_file_handler.setLevel(logging.DEBUG)

    # Create console handler to log messages to the console
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)

    # Create a formatter and set it for both handlers
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    log_file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)

    # Add handlers to the logger
    logger.addHandler(log_file_handler)
    logger.addHandler(console_handler)

    return logger


def backup_postgres(logger, container_name, user_name, database_name):
    # Define the backup directory and ensure it exists
    backup_dir = "./backups"
    os.makedirs(backup_dir, exist_ok=True)

    # Create a timestamp for the backup file name
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")

    # Change the extension to .dump for custom format
    dump_file_in_container = f"/tmp/{database_name}_{timestamp}.dump"
    backup_file_on_host = os.path.join(backup_dir, f"{database_name}_{timestamp}.dump")

    # Construct the pg_dump command with custom format option (-Fc)
    command = [
        "docker",
        "exec",
        "-t",
        container_name,
        "pg_dump",
        "-U",
        user_name,
        "-Fc",  # Custom format option
        database_name,
        "-f",
        dump_file_in_container,  # Output file path in the container
    ]

    try:
        subprocess.run(command, check=True)

        logger.info(
            f"Backup of database '{database_name}' from container '{container_name}' completed successfully."
        )

        # Copying dump file from Docker container to host machine.
        copy_command = [
            "docker",
            "cp",
            f"{container_name}:{dump_file_in_container}",
            backup_file_on_host,
        ]

        subprocess.run(copy_command, check=True)

        logger.info(f"Backup file copied to host: {backup_file_on_host}")

        # Optionally delete temporary dump from container if needed.
        delete_command = [
            "docker",
            "exec",
            container_name,
            "rm",
            dump_file_in_container,
        ]

        subprocess.run(delete_command)

        logger.info(f"Deleted temporary dump file from container.")

    except subprocess.CalledProcessError as e:
        logger.error("Error occurred during backup.")
        logger.error(f"Command: {' '.join(command)}")
        logger.error(f"Return code: {e.returncode}")

        # Decode and log error output if available
        if e.output:
            logger.error(f"Output: {e.output.decode('utf-8')}")
        if e.stderr:
            logger.error(f"Error message: {e.stderr.decode('utf-8')}")

        sys.exit(1)


if __name__ == "__main__":
    setup_logging()

    if len(sys.argv) != 4:
        logging.error(
            "Usage: python backup_postgres.py <container_name> <user_name> <database_name>"
        )
        sys.exit(1)

    container_name = sys.argv[1]
    user_name = sys.argv[2]
    database_name = sys.argv[3]

    logger = logging.getLogger("PostgresBackup")

    backup_postgres(logger, container_name, user_name, database_name)
