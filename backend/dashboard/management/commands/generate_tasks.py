from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from dashboard.models import Task
from file.models import Sell, Rent


class Command(BaseCommand):
    help = "Generates periodic tasks and date-based tasks from other models"

    def handle(self, *args, **options):
        self.stdout.write("Starting task generation...")

        # 1. Create tasks based on dates from other models
        self.create_date_based_tasks()

        # 2. Create periodic recurring tasks
        self.create_periodic_tasks()

        self.stdout.write(self.style.SUCCESS("Task generation completed"))

    def create_periodic_tasks(self):
        """Create regularly recurring tasks"""
        today = timezone.now().date()

        # Daily task example
        Task.objects.get_or_create(
            text="فایل گرفتن",
            defaults={"due_date": today, "completed": False},
        )
        # Daily task example
        Task.objects.get_or_create(
            text="وارد کردن فایل ها",
            defaults={"due_date": today, "completed": False},
        )

        # Weekly task example (every Monday)
        # if today.weekday() == 0:  # Monday
        #     Task.objects.get_or_create(
        #         text="Weekly team meeting preparation",
        #         defaults={"due_date": today, "completed": False},
        #     )

    def create_date_based_tasks(self):
        """Create tasks based on dates from other models"""
        today = timezone.now().date()

        # file status
        # it adds tasks for updating old files
        sell_files = Sell.objects.filter(
            updated__date__lte=today - timedelta(days=30),
            updated__date__gte=today - timedelta(days=180),
        )
        rent_files = Rent.objects.filter(
            updated__date__lte=today - timedelta(days=30),
            updated__date__gte=today - timedelta(days=180),
        )

        # recovery files
        # sell_recovery_files = Sell.objects.filter(date=today - timedelta(days=30))
        rent_recovery_files = Rent.objects.filter(
            date__month=today.month,
            date__day=today.day,
        )

        # TODO: customers status update

        for file in sell_files:
            Task.objects.get_or_create(
                text=f"آپدیت فایل فروش-{file.id}",
                defaults={"due_date": today, "completed": False},
            )
        for file in rent_files:
            Task.objects.get_or_create(
                text=f"آپدیت فایل اجاره-{file.id}",
                defaults={"due_date": today, "completed": False},
            )

        for file in rent_recovery_files:
            Task.objects.get_or_create(
                text=f"احیای فایل اجاره-{file.id}",
                defaults={"due_date": today, "completed": False},
            )
