from django.db.models import Count 
from django.db.models.functions import TruncDate, TruncYear, TruncMonth
from django.utils.dateparse import parse_date
from rest_framework.views import APIView
from rest_framework.response import Response
from customer.models import BuyCustomer, RentCustomer
from file.models import Sell, Rent
from datetime import datetime


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

