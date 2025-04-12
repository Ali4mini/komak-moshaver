import os
import subprocess
import sys
import logging


def setup_logging():
    # Create a logger
    logger = logging.getLogger("PostgresRestore")
    logger.setLevel(logging.DEBUG)

    # Create file handler to log messages to a file
    log_file_handler = logging.FileHandler("restore_postgres.log")
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


def clean_restore_postgres(logger, container_name, user_name, database_name, dump_file):
    # Check if the dump file exists
    if not os.path.isfile(dump_file):
        logger.error(f"Dump file '{dump_file}' does not exist.")
        sys.exit(1)

    # Copy the dump file into the Docker container
    try:
        subprocess.run(
            ["docker", "cp", dump_file, f"{container_name}:/tmp/"], check=True
        )
        logger.info(
            f"Copied dump file '{dump_file}' to container '{container_name}' at '/tmp/'."
        )
    except subprocess.CalledProcessError as e:
        logger.error("Error occurred while copying the dump file.")
        logger.error(f"Command: {' '.join(e.cmd)}")
        logger.error(f"Return code: {e.returncode}")
        sys.exit(1)

    # Restore the database using pg_restore for custom format or psql for SQL files
    try:
        if dump_file.endswith(".dump"):
            restore_command = [
                "docker",
                "exec",
                "-i",
                container_name,
                "pg_restore",
                "-U",
                user_name,
                "-d",
                database_name,
                "-c",
                f"/tmp/{os.path.basename(dump_file)}",
            ]
        else:
            restore_command = [
                "docker",
                "exec",
                "-i",
                container_name,
                "psql",
                "-U",
                user_name,
                "-d",
                database_name,
                "-f",
                f"/tmp/{os.path.basename(dump_file)}",
            ]

        subprocess.run(restore_command, check=True)

        if dump_file.endswith(".dump"):
            logger.info(
                f"Restored database '{database_name}' from custom format dump file '{dump_file}'."
            )
        else:
            logger.info(
                f"Restored database '{database_name}' from SQL dump file '{dump_file}'."
            )

        # Delete the backup file from the Docker container after successful restoration
        delete_command = [
            "docker",
            "exec",
            container_name,
            "rm",
            f"/tmp/{os.path.basename(dump_file)}",
        ]

        subprocess.run(delete_command, check=True)

        logger.info(
            f"Deleted backup file '{dump_file}' from container '{container_name}'."
        )

    except subprocess.CalledProcessError as e:
        logger.error("Error occurred during database restoration.")
        logger.error(f"Command: {' '.join(e.cmd)}")
        logger.error(f"Return code: {e.returncode}")
        sys.exit(1)


if __name__ == "__main__":
    setup_logging()

    if len(sys.argv) != 5:
        logging.error(
            "Usage: python restore_postgres.py <container_name> <user_name> <database_name> <dump_file>"
        )
        sys.exit(1)

    container_name = sys.argv[1]
    user_name = sys.argv[2]
    database_name = sys.argv[3]
    dump_file = sys.argv[4]

    logger = logging.getLogger("PostgresRestore")

    clean_restore_postgres(logger, container_name, user_name, database_name, dump_file)
