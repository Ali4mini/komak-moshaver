import itertools
from datetime import timedelta

from django.core.management.base import BaseCommand
from django.utils import timezone

# NEW: Required for using GenericForeignKey
from django.contrib.contenttypes.models import ContentType

# Make sure the import paths match your project structure
from dashboard.models import Task
from file.models import Sell, Rent


class Command(BaseCommand):
    """
    A Django management command to automatically generate daily tasks.

    This command is designed to be run once per day via a cron job or scheduler.
    It performs the following actions:
    1. Creates recurring, periodic tasks (e.g., "Get new files").
    2. Creates tasks to remind users to update old property files (Sell/Rent).
    3. Creates tasks to follow up on rental agreements on their anniversary.

    It uses a GenericForeignKey on the Task model to create direct links from
    a task to the specific object it relates to (e.g., a Sell file).

    The command is idempotent, meaning running it multiple times on the same
    day will not create duplicate tasks.
    """

    help = "Generates daily and date-based tasks for the CRM, with links to related objects."

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS("--- Starting Daily Task Generation ---"))
        today = timezone.now().date()

        # Execute each task generation function
        self.create_periodic_tasks(today)
        self.create_file_update_tasks(today)
        self.create_file_recovery_tasks(today)

        self.stdout.write(
            self.style.SUCCESS("--- Task Generation Completed Successfully ---")
        )

    def _create_task_if_not_exists(self, text, due_date, related_obj=None):
        """
        A robust helper to create a task only if it doesn't already exist for the
        given text and due_date. It can optionally link the task to another object.

        Args:
            text (str): The descriptive text for the task.
            due_date (date): The due date for the task.
            related_obj (Model instance, optional): The object to link to the task. Defaults to None.

        Returns:
            tuple: A tuple containing the task object and a boolean indicating if it was created.
        """
        # The key to idempotency: lookup includes the due_date. This ensures a task
        # with the same text is unique for each day.
        task, created = Task.objects.get_or_create(
            text=text,
            due_date=due_date,
            defaults={
                "completed": False,
                # Set the content_object using the provided model instance.
                # If related_obj is None, these fields will be null.
                "content_object": related_obj,
            },
        )

        if created:
            link_info = (
                f" -> linked to {related_obj.__class__.__name__}:{related_obj.id}"
                if related_obj
                else ""
            )
            self.stdout.write(
                f"  [CREATED] Task: '{task.text}' for {task.due_date}{link_info}"
            )

        # We don't print an "EXISTS" message anymore to reduce noise,
        # but you could add it back for debugging.
        # else:
        #     self.stdout.write(f"  [EXISTS] Task: '{task.text}' for {task.due_date}")

        return task, created

    def create_periodic_tasks(self, today):
        """Creates regularly recurring tasks that are not linked to a specific object."""
        self.stdout.write(self.style.NOTICE("\nChecking for periodic tasks..."))

        self._create_task_if_not_exists(text="فایل گرفتن", due_date=today)
        self._create_task_if_not_exists(text="وارد کردن فایل ها", due_date=today)

        # Example for a weekly task (every Saturday - weekday() == 5 in Python)
        if today.weekday() == 5:
            self._create_task_if_not_exists(
                text="آماده سازی جلسه هفتگی", due_date=today
            )

    def create_file_update_tasks(self, today):
        """Generates tasks to remind users to update old files, linking to them directly."""
        self.stdout.write(
            self.style.NOTICE("\nChecking for files needing an update...")
        )

        # Files that haven't been updated in 30 days but are not older than 180 days.
        thirty_days_ago = today - timedelta(days=30)
        one_hundred_eighty_days_ago = today - timedelta(days=180)

        # Assuming your models have `updated` and `is_archived` fields.
        sell_files_to_update = Sell.objects.filter(
            updated__date__lte=thirty_days_ago,
            updated__date__gt=one_hundred_eighty_days_ago,
            # is_archived=False,
            # TODO: add is_archived to the file model
        )
        rent_files_to_update = Rent.objects.filter(
            updated__date__lte=thirty_days_ago,
            updated__date__gt=one_hundred_eighty_days_ago,
            # is_archived=False,
        )

        # Combine querysets to avoid repeating the loop (DRY principle)
        all_files_to_update = itertools.chain(
            sell_files_to_update, rent_files_to_update
        )

        count = 0
        for file in all_files_to_update:
            file_type_fa = "فروش" if isinstance(file, Sell) else "اجاره"
            # The text still contains the ID for human readability in case the link fails
            task_text = f"آپدیت فایل {file_type_fa}-{file.id}"

            # Pass the 'file' object itself to the helper to create the link
            _, created = self._create_task_if_not_exists(
                text=task_text, due_date=today, related_obj=file
            )
            if created:
                count += 1

        if count > 0:
            self.stdout.write(
                self.style.SUCCESS(f"-> Generated {count} tasks for file updates.")
            )
        else:
            self.stdout.write("-> No new file update tasks were needed.")

    def create_file_recovery_tasks(self, today):
        """Generates tasks to follow up on rental files on their anniversary."""
        self.stdout.write(
            self.style.NOTICE("\nChecking for files needing recovery/follow-up...")
        )

        # Get Rent files where the creation date anniversary is today.
        # This is more robust than `date=today - timedelta(days=365)` due to leap years.
        rent_recovery_files = Rent.objects.filter(
            created__month=today.month,
            created__day=today.day,
            # is_archived=False,
        )

        count = 0
        for file in rent_recovery_files:
            # Don't create a task on the same day the file was created.
            # This prevents a task from being created immediately for new files.
            if file.created.date() != today:
                task_text = f"احیای فایل اجاره (سالگرد) - کد: {file.id}"

                # Pass the 'file' object to link it
                _, created = self._create_task_if_not_exists(
                    text=task_text, due_date=today, related_obj=file
                )
                if created:
                    count += 1

        if count > 0:
            self.stdout.write(
                self.style.SUCCESS(f"-> Generated {count} tasks for file recovery.")
            )
        else:
            self.stdout.write("-> No new file recovery tasks were needed.")
