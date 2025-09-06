import logging
import os
import shutil
import subprocess
import sys
import time
from datetime import datetime

# --- Main Configuration ---
# Directory to store backup files
BACKUP_DIR = "./backups"
# The hardcoded path to your media directory on the host machine
MEDIA_DIR_PATH = "../media"
# Number of days to keep old backups. Set to 0 to disable cleanup.
DAYS_TO_KEEP_BACKUPS = 7


def setup_logging():
    """Sets up logging to both a file and the console."""
    logger = logging.getLogger("AppBackup")
    logger.setLevel(logging.DEBUG)
    if logger.hasHandlers():
        logger.handlers.clear()
    log_file_handler = logging.FileHandler("backup.log")
    log_file_handler.setLevel(logging.DEBUG)
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    log_file_handler.setFormatter(formatter)
    console_handler.setFormatter(formatter)
    logger.addHandler(log_file_handler)
    logger.addHandler(console_handler)
    return logger


def backup_postgres(logger, container_name: str, user_name: str, database_name: str):
    """Creates a backup of a PostgreSQL database from a running Docker container."""
    logger.info(f"Starting PostgreSQL backup for database '{database_name}'...")
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    dump_file_in_container = f"/tmp/{database_name}_{timestamp}.dump"
    backup_file_on_host = os.path.join(
        BACKUP_DIR, f"db_{database_name}_{timestamp}.dump"
    )
    dump_command = [
        "docker",
        "exec",
        "-t",
        container_name,
        "pg_dump",
        "-U",
        user_name,
        "-d",
        database_name,
        "-Fc",
        "-f",
        dump_file_in_container,
    ]
    copy_command = [
        "docker",
        "cp",
        f"{container_name}:{dump_file_in_container}",
        backup_file_on_host,
    ]
    delete_command = ["docker", "exec", container_name, "rm", dump_file_in_container]
    try:
        subprocess.run(dump_command, check=True, capture_output=True, text=True)
        logger.info(
            f"Successfully created temporary dump inside container '{container_name}'."
        )
        subprocess.run(copy_command, check=True, capture_output=True, text=True)
        logger.info(f"Database backup successful. File saved to: {backup_file_on_host}")
    except subprocess.CalledProcessError as e:
        logger.error("Error occurred during PostgreSQL backup.")
        logger.error(f"Command: {' '.join(e.cmd)}")
        logger.error(f"Stderr: {e.stderr.strip()}")
        return False
    finally:
        try:
            subprocess.run(delete_command, check=True, capture_output=True, text=True)
            logger.info(f"Successfully cleaned up temporary file in container.")
        except subprocess.CalledProcessError as e:
            logger.warning("Could not remove temporary dump file from container.")
            logger.warning(f"Stderr: {e.stderr.strip()}")
    return True


def backup_media_files(logger):
    """Archives the user-uploaded media directory using the hardcoded path."""
    logger.info(f"Starting backup for media directory '{MEDIA_DIR_PATH}'...")
    if not os.path.isdir(MEDIA_DIR_PATH):
        logger.error(f"Media directory not found at: {MEDIA_DIR_PATH}")
        return False
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    archive_base_name = os.path.join(BACKUP_DIR, f"media_backup_{timestamp}")
    try:
        archive_path = shutil.make_archive(
            base_name=archive_base_name,
            format="gztar",
            root_dir=os.path.dirname(MEDIA_DIR_PATH),  # e.g., './backend'
            base_dir=os.path.basename(MEDIA_DIR_PATH),  # e.g., 'media'
        )
        logger.info(f"Media files backup successful. Archive saved to: {archive_path}")
    except Exception as e:
        logger.error(f"Error occurred during media files backup: {e}")
        return False
    return True


def cleanup_old_backups(logger):
    """Removes backup files older than DAYS_TO_KEEP_BACKUPS."""
    if DAYS_TO_KEEP_BACKUPS <= 0:
        logger.info("Backup cleanup is disabled.")
        return
    logger.info(f"Cleaning up backups older than {DAYS_TO_KEEP_BACKUPS} days...")
    cutoff_time = time.time() - (DAYS_TO_KEEP_BACKUPS * 86400)
    files_deleted = 0
    try:
        for filename in os.listdir(BACKUP_DIR):
            file_path = os.path.join(BACKUP_DIR, filename)
            if os.path.isfile(file_path):
                if os.path.getmtime(file_path) < cutoff_time:
                    os.remove(file_path)
                    logger.debug(f"Deleted old backup file: {file_path}")
                    files_deleted += 1
        logger.info(f"Cleanup complete. Deleted {files_deleted} old backup file(s).")
    except Exception as e:
        logger.error(f"Error during backup cleanup: {e}")


def main():
    """Main function to orchestrate the backup process."""
    logger = setup_logging()

    if len(sys.argv) != 4:
        logger.error("Usage: python backup.py <db_container_name> <db_user> <db_name>")
        logger.error("Example: python backup.py postgres amlak amlak")
        sys.exit(1)

    db_container = sys.argv[1]
    db_user = sys.argv[2]
    db_name = sys.argv[3]

    logger.info("--- Starting Full Application Backup ---")
    os.makedirs(BACKUP_DIR, exist_ok=True)

    # Perform backups
    db_success = backup_postgres(logger, db_container, db_user, db_name)
    media_success = backup_media_files(logger)

    if not db_success or not media_success:
        logger.error("One or more backup steps failed. Please check the log.")
        sys.exit(1)

    cleanup_old_backups(logger)
    logger.info("--- Full Application Backup Finished Successfully ---")


if __name__ == "__main__":
    main()
