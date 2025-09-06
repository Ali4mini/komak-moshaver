import subprocess
import sys
import textwrap
from pathlib import Path

# --- Configuration

# unique identifier for komak-moshaver jobs
CRON_MARKER = "KOMAK-MOSHAVER-APP__ADDED-AUTOMATICALLY"

# --- Cron Jobs
PROJECT_ROOT = Path(__file__).resolve().parent
PYTHON_EXEC = sys.executable

# textwrap.dedent cleans up the indentation for a cleaner crontab file.
CRON_JOBS = textwrap.dedent(
    f"""
    # Daily Backup 
    * 11 * * * cd "{PROJECT_ROOT}" && {PYTHON_EXEC} utils/postgres-backuper.py komak-moshaver-postgres-1 amlak amlak >> "{PROJECT_ROOT}/backup.log" 2>&1


    # custom generate_tasks command to run every day
    0 11 * * * cd "{PROJECT_ROOT}" && docker exec -it komak-moshaver-backend-1 poetry run python manage.py generate_tasks >> "{PROJECT_ROOT}/cron.log" 2>&1
"""
)


def get_current_crontab() -> str:
    """Gets the current crontab content for the user."""
    try:
        # The 'crontab -l' command returns a non-zero exit code if the crontab is empty,
        # which would raise an error with check=True. We handle this case.
        result = subprocess.run(["crontab", "-l"], capture_output=True, text=True)
        if result.returncode > 1:
            result.check_returncode()  # Raise an exception for real errors
        return result.stdout
    except FileNotFoundError:
        print("Error: 'crontab' command not found. Is it installed and in your PATH?")
        sys.exit(1)


def install_crontab(content: str):
    """Installs new content into the user's crontab."""
    process = subprocess.run(
        ["crontab", "-"], input=content, text=True, capture_output=True
    )
    if process.returncode != 0:
        print("Error installing new crontab:")
        print(process.stderr)
        sys.exit(1)


def main():
    """Main function to manage and install the application's cron jobs."""
    print("Setting up cron jobs for komak-moshaver ...")

    start_marker = f"# BEGIN {CRON_MARKER}"
    end_marker = f"# END {CRON_MARKER}"

    current_crontab = get_current_crontab()

    # Filter out the old jobs managed by this script
    clean_crontab_lines = []
    in_managed_block = False
    for line in current_crontab.splitlines():
        if line.strip() == start_marker:
            in_managed_block = True
            continue
        if line.strip() == end_marker:
            in_managed_block = False
            continue
        if not in_managed_block:
            clean_crontab_lines.append(line)

    new_crontab_content = "\n".join(clean_crontab_lines)

    # make sure there's a newline between old and new content
    if new_crontab_content and not new_crontab_content.endswith("\n"):
        new_crontab_content += "\n"

    new_crontab_content += f"{start_marker}\n"
    new_crontab_content += CRON_JOBS.strip() + "\n"
    new_crontab_content += f"{end_marker}\n"

    install_crontab(new_crontab_content)

    print("Cron jobs have been successfully updated.")
    print("Run 'crontab -l' to verify.")


if __name__ == "__main__":
    main()
