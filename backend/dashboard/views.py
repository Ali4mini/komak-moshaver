# from os import wait # Unused import
from datetime import datetime

from django.db import connection
from django.db.models import Count
from django.db.models.functions import TruncDate, TruncMonth, TruncYear
from django.utils import timezone
from django.utils.dateparse import parse_date
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView

from customer.models import BuyCustomer, RentCustomer
from file.models import Rent, Sell
from logs.models import BaseTourLog, Call, RentTour, SellTour
from utils.paginations import StandardPagination

from .filters import CallFilter
from .models import Task
from .serializers import TaskSerializer


# --- Helper Function ---
def find_last_update_date():
    with connection.cursor() as cursor:
        cursor.execute(
            """
            SELECT MAX(updated_at) FROM (
                SELECT updated_at FROM file_Sell
                WHERE owner_name <> 'UNKNOWN' AND owner_name IS NOT NULL
                ORDER BY updated_at DESC
            ) AS subquery;
        """
        )
        result = cursor.fetchone()
        if (
            result and result[0]
        ):  # Check if result is not None and the value is not None
            return result[0]  # Return the date value directly
        else:
            return None


# --- API Views ---


class FilePriceDiversity(APIView):
    def get(self, request):
        # Assumes Sell model has a 'price' field
        sell_lte_2000 = Sell.objects.filter(price__lte=2000).count()
        sell_2000_3000 = Sell.objects.filter(price__gte=2000, price__lte=3000).count()
        sell_3000_5000 = Sell.objects.filter(price__gte=3000, price__lte=5000).count()
        sell_5000_8000 = Sell.objects.filter(price__gte=5000, price__lte=8000).count()
        sell_gte_8000 = Sell.objects.filter(price__gte=8000).count()

        sell_price_diversity = {
            "below_2000": sell_lte_2000,
            "2000_3000": sell_2000_3000,
            "3000_5000": sell_3000_5000,
            "5000_8000": sell_5000_8000,
            "higher_8000": sell_gte_8000,
        }
        return Response(sell_price_diversity)


class CustomerBudgetDiversity(APIView):
    def get(self, request):
        # Assumes BuyCustomer model has a 'budget' field
        sell_lte_2000 = BuyCustomer.objects.filter(budget__lte=2000).count()
        sell_2000_3000 = BuyCustomer.objects.filter(
            budget__gte=2000, budget__lte=3000
        ).count()
        sell_3000_5000 = BuyCustomer.objects.filter(
            budget__gte=3000, budget__lte=5000
        ).count()
        sell_5000_8000 = BuyCustomer.objects.filter(
            budget__gte=5000, budget__lte=8000
        ).count()
        sell_gte_8000 = BuyCustomer.objects.filter(budget__gte=8000).count()

        sell_budget_diversity = {
            "below_2000": sell_lte_2000,
            "2000_3000": sell_2000_3000,
            "3000_5000": sell_3000_5000,
            "5000_8000": sell_5000_8000,
            "higher_8000": sell_gte_8000,
        }
        return Response(sell_budget_diversity)


class FileTypeDiversity(APIView):
    def get(self, request, format=None):

        sell_property_type_counts = (
            Sell.objects.values("property_type")
            .annotate(count=Count("property_type"))
            .order_by("property_type")
        )
        rent_property_type_counts = (
            Rent.objects.values("property_type")
            .annotate(count=Count("property_type"))
            .order_by("property_type")
        )

        sell_data = []
        for item in sell_property_type_counts:
            type_key = item["property_type"]
            type_label = Sell.Types(type_key).label  # Get the human-readable label
            count = item["count"]

            sell_data.append(
                {
                    "key": type_key,
                    "type": type_label,
                    "count": count,
                }
            )

        rent_data = []
        for item in rent_property_type_counts:
            type_key = item["property_type"]
            type_label = Rent.Types(type_key).label
            count = item["count"]

            rent_data.append(
                {
                    "key": type_key,
                    "type": type_label,
                    "count": count,
                }
            )

        # No need to calculate percentages here if the chart will do it or if counts are preferred
        return Response({"sell": sell_data, "rent": rent_data})


class CustomerTypeDiversity(APIView):
    def get(self, request, format=None):
        property_type_counts = Sell.objects.values("property_type").annotate(
            count=Count("property_type")
        )
        total_count = sum(item["count"] for item in property_type_counts)
        property_type_percentages = []

        if total_count > 0:  # Avoid division by zero
            for item in property_type_counts:
                percentage = (item["count"] / total_count) * 100
                human_readable_name = Sell.Types(
                    item["property_type"]
                ).label  # Assumes Sell.Types exists
                property_type_percentages.append(
                    {"type": human_readable_name, "percentage": round(percentage, 2)}
                )
        return Response(property_type_percentages)


class CustomersCounts(APIView):
    def get(self, request, format=None):
        start_date_str = request.query_params.get("start_date", None)
        if start_date_str is None:
            start_date = (
                timezone.now()
                .replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                .date()
            )
        else:
            try:
                start_date = parse_date(start_date_str)
                if start_date is None:  # parse_date returns None on failure
                    raise ValueError
            except ValueError:
                return Response(
                    {"error": "Invalid start_date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        def calculate_counts(model, period_func, period_label):
            counts = (
                model.objects.filter(created_at__date__gte=start_date)
                .annotate(period=period_func("created_at"))
                .values("period")
                .annotate(count=Count("id"))
                .order_by("period")
            )
            return [
                {
                    "date": item["period"].strftime(
                        "%Y-%m-%d"
                        if period_func == TruncDate
                        else "%Y-%m" if period_func == TruncMonth else "%Y"
                    ),
                    "count": item["count"],
                }
                for item in counts
            ]

        buy_customer_daily_counts = calculate_counts(BuyCustomer, TruncDate, "day")
        buy_customer_monthly_counts = calculate_counts(BuyCustomer, TruncMonth, "month")
        buy_customer_yearly_counts = calculate_counts(BuyCustomer, TruncYear, "year")

        rent_customer_daily_counts = calculate_counts(RentCustomer, TruncDate, "day")
        rent_customer_monthly_counts = calculate_counts(
            RentCustomer, TruncMonth, "month"
        )
        rent_customer_yearly_counts = calculate_counts(RentCustomer, TruncYear, "year")

        return Response(
            {
                "buyCustomer": {
                    "daily": buy_customer_daily_counts,
                    "monthly": buy_customer_monthly_counts,
                    "yearly": buy_customer_yearly_counts,
                },
                "rentCustomer": {
                    "daily": rent_customer_daily_counts,
                    "monthly": rent_customer_monthly_counts,
                    "yearly": rent_customer_yearly_counts,
                },
            }
        )


class FilesCounts(APIView):
    def get(self, request, format=None):
        start_date_str = request.query_params.get("start_date", None)
        if start_date_str is None:
            start_date = (
                timezone.now()
                .replace(day=1, hour=0, minute=0, second=0, microsecond=0)
                .date()
            )
        else:
            try:
                start_date = parse_date(start_date_str)
                if start_date is None:  # parse_date returns None on failure
                    raise ValueError
            except ValueError:
                return Response(
                    {"error": "Invalid start_date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        def get_counts_for_model(model_class):
            daily = (
                model_class.objects.filter(created_at__date__gte=start_date)
                .annotate(day=TruncDate("created_at"))
                .values("day")
                .annotate(count=Count("id"))
                .order_by("day")
            )
            monthly = (
                model_class.objects.filter(created_at__date__gte=start_date)
                .annotate(month=TruncMonth("created_at"))
                .values("month")
                .annotate(count=Count("id"))
                .order_by("month")
            )
            yearly = (
                model_class.objects.filter(created_at__date__gte=start_date)
                .annotate(year=TruncYear("created_at"))
                .values("year")
                .annotate(count=Count("id"))
                .order_by("year")
            )
            return {
                "daily": [
                    {"date": item["day"].strftime("%Y-%m-%d"), "count": item["count"]}
                    for item in daily
                ],
                "monthly": [
                    {"date": item["month"].strftime("%Y-%m"), "count": item["count"]}
                    for item in monthly
                ],
                "yearly": [
                    {"date": item["year"].strftime("%Y"), "count": item["count"]}
                    for item in yearly
                ],
            }

        return Response(
            {"sell": get_counts_for_model(Sell), "rent": get_counts_for_model(Rent)}
        )


# class TaskViewSet(viewsets.ModelViewSet):
#     serializer_class = TaskSerializer
#     # permission_classes = [permissions.IsAuthenticated]
#
#     def get_queryset(self):
#         """
#         Dynamically filter the queryset based on query parameters.
#         """
#         queryset = Task.objects.all() # Start with all tasks for the user
#
#         # --- Filtering Logic ---
#         # Get the 'view' parameter from the request URL, e.g., /api/tasks/?view=today
#         view = self.request.query_params.get("view", "today")  # Default to 'today'
#
#         if view == "today":
#             # Default view: Non-archived tasks due today or with no due date.
#             today = timezone.now().date()
#             queryset = queryset.filter(
#                 (Q(due_date=today) | Q(due_date__isnull=True)), is_archived=False
#             )
#         elif view == "upcoming":
#             # Non-archived tasks with a due date in the future.
#             today = timezone.now().date()
#             queryset = queryset.filter(due_date__gt=today, is_archived=False)
#         elif view == "archived":
#             queryset = queryset.filter(is_archived=True)
#
#         # --- Sorting Logic ---
#         # Consistent sorting for all views.
#         return queryset.order_by("is_archived", "completed", "due_date", "-created_at")
#
#     def perform_create(self, serializer):
#         serializer.save()
#
#     @action(detail=True, methods=["post"], url_path="toggle-complete")
#     def toggle_complete(self, request, pk=None):
#         task = self.get_object()
#         task.completed = not task.completed
#         task.save()
#         return Response(self.get_serializer(task).data, status=status.HTTP_200_OK)
#
#     # The list_archived_tasks and list_all_tasks methods are no longer needed!
#     # GET /api/tasks/?view=archived
#     # GET /api/tasks/?view=all
#     # ...are now handled by get_queryset.


class TaskViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing, creating, and editing tasks.

    Provides standard CRUD operations.
    Includes filtering for different views: 'today', 'all', 'done', 'archived'.
    Includes a custom action to toggle the completion status of a task.
    """

    serializer_class = TaskSerializer
    # permission_classes = [IsAuthenticated]
    pagination_class = StandardPagination

    def get_queryset(self):
        """
        This view should return a list of all the tasks
        filtered by the 'view' query param.
        """
        queryset = Task.objects.all()

        if self.action != "list":
            return queryset

        view = self.request.query_params.get("view", "today").lower()

        if view == "today":
            # Return non-archived tasks created today
            today = timezone.now().date()
            res = queryset.filter(due_date=today, is_archived=False)
            print(res)
            return res
        elif view == "all":
            # Return all non-archived tasks
            return queryset.filter(is_archived=False)
        elif view == "done":
            # Return completed tasks
            return queryset.filter(completed=True)
        elif view == "archived":
            # Return only archived tasks
            return queryset.filter(is_archived=True)

        # Default to today's tasks if the view parameter is invalid
        print("invalid view parameter")
        today = timezone.now().date()
        return queryset.filter(due_date=today, is_archived=False)

    @action(detail=True, methods=["post"], url_path="toggle-complete")
    def toggle_complete(self, request, pk=None):
        """
        An action to toggle the 'completed' status of a task.
        """
        task = self.get_object()
        task.completed = not task.completed
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)


class CallCountView(APIView):
    # permission_classes = [permissions.IsAuthenticated] # Adjust as needed

    def get(self, request, *args, **kwargs):
        # Call model fields are used by CallFilter: agent, start_time, end_time, location (JSON),
        # call_type, call_status, phone_number, is_transcript_correct, person. These match the model.
        filterset = CallFilter(request.GET, queryset=Call.objects.all())
        if not filterset.is_valid():
            return Response(filterset.errors, status=status.HTTP_400_BAD_REQUEST)
        count = filterset.qs.count()
        return Response({"count": count})


class TourCountView(APIView):
    def get(self, request, *args, **kwargs):
        params = request.query_params
        filter_kwargs = {}

        start_date_str = params.get("start_date")
        end_date_str = params.get("end_date")

        if start_date_str:
            try:
                start_date_obj = datetime.strptime(start_date_str, "%Y-%m-%d").date()
                filter_kwargs["created_at__date__gte"] = (
                    start_date_obj  # Corrected from 'created'
                )
            except ValueError:
                return Response(
                    {"error": "Invalid start_date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        if end_date_str:
            try:
                end_date_obj = datetime.strptime(end_date_str, "%Y-%m-%d").date()
                filter_kwargs["created_at__date__lte"] = (
                    end_date_obj  # Corrected from 'created'
                )
            except ValueError:
                return Response(
                    {"error": "Invalid end_date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

        tour_type_filter = params.get("tour_type")
        if tour_type_filter:
            # Accessing choices from BaseTourLog.TourTypes as it's the source
            valid_tour_types = (
                BaseTourLog.TourTypes.values
            )  # Corrected from RentTour.Type
            if tour_type_filter.upper() not in valid_tour_types:
                return Response(
                    {
                        "error": f"Invalid tour_type. Must be one of {', '.join(valid_tour_types)}."
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )
            # RentTour and SellTour inherit 'tour_type' from BaseTourLog.
            filter_kwargs["tour_type"] = tour_type_filter.upper()

        rent_tour_count = RentTour.objects.filter(**filter_kwargs).count()
        sell_tour_count = SellTour.objects.filter(**filter_kwargs).count()

        return Response(
            {
                "rent_tour_count": rent_tour_count,
                "sell_tour_count": sell_tour_count,
                "total_tour_count": rent_tour_count + sell_tour_count,
                "filters_applied": {k: str(v) for k, v in filter_kwargs.items()},
            },
            status=status.HTTP_200_OK,
        )
