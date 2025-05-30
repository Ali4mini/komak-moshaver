from os import wait
from django.db.models import Count 
from django.db.models.functions import TruncDate, TruncYear, TruncMonth
from django.utils.dateparse import parse_date
from rest_framework.views import APIView
from rest_framework.response import Response
from customer.models import BuyCustomer, RentCustomer
from file.models import Sell, Rent
from customer.models import BuyCustomer
from datetime import datetime
from django.db import connection
from rest_framework import viewsets, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django.db.models import Q

from logs.models import Call
from .filters import CallFilter
from .models import Task
from logs.models import RentTour, SellTour
from .serializers import TaskSerializer # Make sure your serializer includes 'user', 'due_date', 'is_archived'

def find_last_update_date():
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT MAX(updated) FROM (
                SELECT updated FROM file_Sell
                WHERE owner_name <> 'UNKNOWN' AND owner_name IS NOT NULL
                ORDER BY updated DESC
            ) AS subquery;
        """)
        result = cursor.fetchone()
        if result:
            return result
        else:
            return None


class FilePriceDiversity(APIView):
    def get(self, request):
        sell_file_counts = Sell.objects.count()
        rent_file_counts = Rent.objects.count()
        
        sell_lte_2000 = Sell.objects.filter(price__lte=2000).count()
        sell_2000_3000 = Sell.objects.filter(price__gte=2000, price__lte=3000).count()
        sell_3000_5000 = Sell.objects.filter(price__gte=3000, price__lte=5000).count()
        sell_5000_8000 = Sell.objects.filter(price__gte=5000, price__lte=8000).count()
        sell_gte_8000 = Sell.objects.filter(price__gte=8000).count()

        sell_price_diversity = {
            "below_2000": round(sell_lte_2000 / (sell_file_counts / 100), 2), 
            "2000_3000": round(sell_2000_3000 / (sell_file_counts / 100), 2),
            "3000_5000": round(sell_3000_5000 / (sell_file_counts / 100), 2),
            "5000_8000": round(sell_5000_8000 / (sell_file_counts / 100), 2),
            "higher_8000": round(sell_gte_8000 / (sell_file_counts / 100), 2), 
        }

        
        return Response(sell_price_diversity)
        
class CustomerBudgetDiversity(APIView):
    def get(self, request):
        sell_file_counts = BuyCustomer.objects.count()
        
        sell_lte_2000 = BuyCustomer.objects.filter(budget__lte=2000).count()
        sell_2000_3000 = BuyCustomer.objects.filter(budget__gte=2000, budget__lte=3000).count()
        sell_3000_5000 = BuyCustomer.objects.filter(budget__gte=3000, budget__lte=5000).count()
        sell_5000_8000 = BuyCustomer.objects.filter(budget__gte=5000, budget__lte=8000).count()
        sell_gte_8000 = BuyCustomer.objects.filter(budget__gte=8000).count()

        sell_budget_diversity = {
            "below_2000": round(sell_lte_2000 / (sell_file_counts / 100), 2), 
            "2000_3000": round(sell_2000_3000 / (sell_file_counts / 100), 2),
            "3000_5000": round(sell_3000_5000 / (sell_file_counts / 100), 2),
            "5000_8000": round(sell_5000_8000 / (sell_file_counts / 100), 2),
            "higher_8000": round(sell_gte_8000 / (sell_file_counts / 100), 2), 
        }

        
        return Response(sell_budget_diversity)

class FileTypeDiversity(APIView):
    def get(self, request, format=None):
        # Count the occurrences of each property type
        sell_property_type_counts = Sell.objects.values('property_type').annotate(count=Count('property_type'))
        rent_property_type_counts = Rent.objects.values('property_type').annotate(count=Count('property_type'))
        
        # Calculate the total count of all property types
        sell_total_count = sum([count['count'] for count in sell_property_type_counts])
        rent_total_count = sum([count['count'] for count in rent_property_type_counts])
        
        # Calculate the percentage for each property type and round to two decimal places
        sell_property_type_percentages = []
        for count in sell_property_type_counts:
            percentage = (count['count'] / sell_total_count) * 100
            rounded_percentage = round(percentage, 2)  # Round to two decimal places
            # Map the choice value to its human-readable name
            human_readable_name = Sell.Types(count['property_type']).label
            sell_property_type_percentages.append({
                'type': human_readable_name,
                'percentage': rounded_percentage
            })
        
        rent_property_type_percentages = []
        for count in rent_property_type_counts:
            percentage = (count['count'] / rent_total_count) * 100
            rounded_percentage = round(percentage, 2)  # Round to two decimal places
            # Map the choice value to its human-readable name
            human_readable_name = Rent.Types(count['property_type']).label
            rent_property_type_percentages.append({
                'type': human_readable_name,
                'percentage': rounded_percentage
            })

        return Response({"sell": sell_property_type_percentages, "rent": rent_property_type_percentages})

class CustomerTypeDiversity(APIView):
    def get(self, request, format=None):
        # Count the occurrences of each property type
        property_type_counts = Sell.objects.values('property_type').annotate(count=Count('property_type'))
        
        # Calculate the total count of all property types
        total_count = sum([count['count'] for count in property_type_counts])
        
        # Calculate the percentage for each property type and round to two decimal places
        property_type_percentages = []
        for count in property_type_counts:
            percentage = (count['count'] / total_count) * 100
            rounded_percentage = round(percentage, 2)  # Round to two decimal places
            # Map the choice value to its human-readable name
            human_readable_name = Sell.Types(count['property_type']).label
            property_type_percentages.append({
                'type': human_readable_name,
                'percentage': rounded_percentage
            })
        
        return property_type_percentages
class CustomersCounts(APIView):
    def get(self, request, format=None):
        # Get the start date from the request query parameters
        start_date_str = request.query_params.get('start_date', None)
        
        # If start_date is not provided, set it to the start of the current month
        if start_date_str is None:
            start_date = datetime.now().replace(day=1)
        else:
            try:
                start_date = parse_date(start_date_str)
            except ValueError:
                return Response({"error": "Invalid start date format"}, status=400)
        
        # Define a function to calculate counts for a given model and period
        def calculate_counts(model, period_func, period_label):
            counts = model.objects.filter(created__date__gte=start_date).annotate(period=period_func('created')).values('period').annotate(count=Count('id')).order_by('period')
            return [{"date": item['period'].strftime('%Y-%m-%d' if period_func == TruncDate else '%Y-%m' if period_func == TruncMonth else '%Y'), "count": item['count']} for item in counts]
        
        # Calculate counts for BuyCustomer
        buy_customer_daily_counts = calculate_counts(BuyCustomer, TruncDate, 'day')
        buy_customer_monthly_counts = calculate_counts(BuyCustomer, TruncMonth, 'month')
        buy_customer_yearly_counts = calculate_counts(BuyCustomer, TruncYear, 'year')
        
        # Calculate counts for RentCustomer
        rent_customer_daily_counts = calculate_counts(RentCustomer, TruncDate, 'day')
        rent_customer_monthly_counts = calculate_counts(RentCustomer, TruncMonth, 'month')
        rent_customer_yearly_counts = calculate_counts(RentCustomer, TruncYear, 'year')
        
        # Combine all counts into a single response
        return Response({
            "buyCustomer": {
                "daily": buy_customer_daily_counts,
                "monthly": buy_customer_monthly_counts,
                "yearly": buy_customer_yearly_counts
            },
            "rentCustomer": {
                "daily": rent_customer_daily_counts,
                "monthly": rent_customer_monthly_counts,
                "yearly": rent_customer_yearly_counts
            }
        })



class FilesCounts(APIView):
    def get(self, request, format=None):
        # Get the start date from the request query parameters
        start_date_str = request.query_params.get('start_date', None)

        # If start_date is not provided, set it to the start of the current month
        if start_date_str is None:
            start_date = datetime.now().replace(day=1)
        else:
            try:
                start_date = parse_date(start_date_str)
            except ValueError:
                return Response({"error": "Invalid start date format"}, status=400)

        # Calculate the number of customers added per day, per month, and per year starting from the start_date
        sell_daily_counts = Sell.objects.filter(created__date__gte=start_date).annotate(day=TruncDate('created')).values('day').annotate(count=Count('id')).order_by('day')
        sell_monthly_counts = Sell.objects.filter(created__date__gte=start_date).annotate(month=TruncMonth('created')).values('month').annotate(count=Count('id')).order_by('month')
        sell_yearly_counts = Sell.objects.filter(created__date__gte=start_date).extra(select={'year': 'EXTRACT(YEAR FROM created)'}).values('year').annotate(count=Count('id')).order_by('year')
        rent_daily_counts = Rent.objects.filter(created__date__gte=start_date).annotate(day=TruncDate('created')).values('day').annotate(count=Count('id')).order_by('day')
        rent_monthly_counts = Rent.objects.filter(created__date__gte=start_date).annotate(month=TruncMonth('created')).values('month').annotate(count=Count('id')).order_by('month')
        rent_yearly_counts = Rent.objects.filter(created__date__gte=start_date).extra(select={'year': 'EXTRACT(YEAR FROM created)'}).values('year').annotate(count=Count('id')).order_by('year')

        # Convert the queryset to a list of dictionaries for daily counts
        sell_counts_list = [{"date": item['day'].strftime('%Y-%m-%d'), "count": item['count']} for item in sell_daily_counts]
        rent_counts_list = [{"date": item['day'].strftime('%Y-%m-%d'), "count": item['count']} for item in rent_daily_counts]

        # Convert the queryset to a list of dictionaries for monthly counts
        sell_monthly_counts_list = [{"date": item['month'].strftime('%Y-%m'), "count": item['count']} for item in sell_monthly_counts]
        rent_monthly_counts_list = [{"date": item['month'].strftime('%Y-%m'), "count": item['count']} for item in rent_monthly_counts]

        # Convert the queryset to a list of dictionaries for yearly counts
        sell_yearly_counts_list = [{"date": item['year'], "count": item['count']} for item in sell_yearly_counts]
        rent_yearly_counts_list = [{"date": item['year'], "count": item['count']} for item in rent_yearly_counts]

        return Response({
            "sell": {
                "daily": sell_counts_list,
                "monthly": sell_monthly_counts_list,
                "yearly": sell_yearly_counts_list
            },
            "rent": {
                "daily": rent_counts_list,
                "monthly": rent_monthly_counts_list,
                "yearly": rent_yearly_counts_list
            }
        })





class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    # Still require authentication to access the API in general
    # permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        """
        Returns a queryset of tasks.
        Filtering for "today's tasks" vs other views is handled by specific actions or query params.
        """
        # Base queryset no longer filters by user directly at this model level
        base_queryset = Task.objects.all()

        if self.action == 'list':
            today = timezone.now().date()
            return base_queryset.filter(
                (Q(due_date=today) | Q(due_date__isnull=True)),
                is_archived=False
            ).order_by('completed', '-created_at')

        # For other actions, use the model's default ordering or specify one
        return base_queryset.order_by('is_archived', 'due_date', 'completed', '-created_at')

    def perform_create(self, serializer):
        """
        User is no longer directly associated with the task model here.
        If you needed to log who created it, you might do it in a separate audit log
        or associate tasks with a user through a different related model (e.g., Project).
        """
        # serializer.save(user=self.request.user) # REMOVED
        serializer.save()


    @action(detail=True, methods=['post'], url_path='toggle-complete')
    def toggle_complete(self, request, pk=None):
        task = self.get_object() # get_object will fetch any task by ID now
        task.completed = not task.completed
        task.save()
        serializer = self.get_serializer(task)
        return Response(serializer.data, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='archive')
    def archive_task(self, request, pk=None):
        task = self.get_object()
        task.is_archived = True
        task.save()
        return Response({'status': 'task archived'}, status=status.HTTP_200_OK)

    @action(detail=True, methods=['post'], url_path='unarchive')
    def unarchive_task(self, request, pk=None):
        task = self.get_object()
        task.is_archived = False
        task.save()
        return Response({'status': 'task unarchived'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='archived')
    def list_archived_tasks(self, request):
        # Lists all archived tasks, not user-specific at this model level
        archived_tasks = Task.objects.filter(is_archived=True).order_by('-updated_at')
        
        page = self.paginate_queryset(archived_tasks)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(archived_tasks, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='all')
    def list_all_tasks(self, request): # Renamed for clarity
        # Lists all tasks, not user-specific at this model level
        all_tasks = Task.objects.all().order_by('is_archived', 'due_date', 'completed', '-created_at')
        
        page = self.paginate_queryset(all_tasks)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(all_tasks, many=True)
        return Response(serializer.data)



# your_app/views.py
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated # Or your preferred permission
from django_filters.rest_framework import DjangoFilterBackend # Not directly used in APIView but good to know


class CallCountView(APIView):
    """
    Provides a count of Call instances based on provided filters.
    
    Query Parameters:
    - agent (str): Username of the agent.
    - start_date (YYYY-MM-DD): Calls on or after this date.
    - end_date (YYYY-MM-DD): Calls on or before this date.
    - location_city (str): Filter by city in the location JSON.
    - location_country (str): Filter by country in the location JSON.
    - call_type (str): 'IN', 'OUT', or 'MISS'.
    - call_status (str): 'COMP', 'FAIL', 'NOANS', 'BUSY'.
    - phone_number (str): Exact phone number.
    - phone_number__icontains (str): Phone number containing text.
    - is_transcript_correct (bool): 'true' or 'false'.
    - person_id (int): ID of the associated person.
    """
    # permission_classes = [IsAuthenticated] # Adjust as needed

    def get(self, request, *args, **kwargs):
        # Apply filters
        filterset = CallFilter(request.GET, queryset=Call.objects.all())

        # It's good practice to check if the filterset is valid,
        # though for GET requests it usually doesn't raise validation errors
        # unless you have custom validation in your filter.
        if not filterset.is_valid():
            return Response(filterset.errors, status=400)

        filtered_queryset = filterset.qs
        count = filtered_queryset.count()

        return Response({'count': count})


class TourCountView(APIView):
    """
    Provides counts for RentTour and SellTour instances.
    Supports filtering by:
    - `start_date` (YYYY-MM-DD): Filters for tours created on or after this date.
    - `end_date` (YYYY-MM-DD): Filters for tours created on or before this date (inclusive).
    - `tour_type` (P or H): Filters by the tour type.
    """

    def get(self, request, *args, **kwargs):
        params = request.query_params
        filter_kwargs = {}

        # Date filtering for 'created' field
        start_date_str = params.get('start_date')
        end_date_str = params.get('end_date')

        if start_date_str:
            try:
                start_date_obj = datetime.strptime(start_date_str, '%Y-%m-%d').date()
                # Use __date lookup for DateTimeField to compare against the date part
                filter_kwargs['created__date__gte'] = start_date_obj
            except ValueError:
                return Response(
                    {"error": "Invalid start_date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        if end_date_str:
            try:
                end_date_obj = datetime.strptime(end_date_str, '%Y-%m-%d').date()
                # Use __date lookup for DateTimeField to compare against the date part
                # This makes the end_date inclusive for the entire day.
                filter_kwargs['created__date__lte'] = end_date_obj
            except ValueError:
                return Response(
                    {"error": "Invalid end_date format. Use YYYY-MM-DD."},
                    status=status.HTTP_400_BAD_REQUEST
                )

        # Tour type filtering
        tour_type_filter = params.get('tour_type')
        if tour_type_filter:
            valid_tour_types = RentTour.Type.values
            if tour_type_filter.upper() not in valid_tour_types:
                return Response(
                    {"error": f"Invalid tour_type. Must be one of {', '.join(valid_tour_types)}."},
                    status=status.HTTP_400_BAD_REQUEST
                )
            filter_kwargs['tour_type'] = tour_type_filter.upper()

        rent_tour_count = RentTour.objects.filter(**filter_kwargs).count()
        sell_tour_count = SellTour.objects.filter(**filter_kwargs).count()

        return Response({
            "rent_tour_count": rent_tour_count,
            "sell_tour_count": sell_tour_count,
            "total_tour_count": rent_tour_count + sell_tour_count,
            "filters_applied": {k: str(v) for k, v in filter_kwargs.items()} # Make dates strings for JSON
        }, status=status.HTTP_200_OK)
