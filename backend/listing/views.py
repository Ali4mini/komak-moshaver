from file.models import Sell, Rent
from customer.models import BuyCustomer, RentCustomer
from itertools import chain
from rest_framework.views import APIView
from rest_framework.response import Response
from file.serializers import SellFileSerializer, RentFileSerializer
from customer.serializers import BuyCustomerSerializer, RentCustomerSerializer

# Create your views here.


# SECTION - API
class FileFilter(APIView):
    def get(self, request, *args, **kwargs):
        # Copy the original query parameters to avoid modifying the original request
        params = request.query_params.copy()
        
        # Define the allowed fields for filtering
        filter_fields = [
            "id",
            "owner_name",
            "file_type",
            "property_type",
            "price__lte",
            "price__gte",
            "price_up__lte",
            "price_up__gte",
            "price_rent__lte",
            "price_rent__gte",
            "m2__gte",
            "bedroom__gte",
            "year__gte",
            "parking",
            "elevator",
            "storage",
            "status",
        ]
        
        # Define integer and boolean filter fields
        int_filter_fields = [
            "price__lte",
            "price__gte",
            "price_up__lte",
            "price_up__gte",
            "price_rent__lte",
            "price_rent__gte",
            "m2__gte",
            "bedroom__gte",
            "year__gte",
            "id",
        ]
        bool_filter_fields = [
            "parking",
            "elevator",
            "storage",
        ]

        # Initialize an empty dictionary to hold the filter entries
        filter_entry = {}

        # Iterate over all filter fields and populate the filter_entry dictionary
        for field in filter_fields:
            param = params.get(field)
            if param:
                if field in int_filter_fields:
                    param = float(param)
                elif field in bool_filter_fields:
                    param = bool(param)

                filter_entry[field] = param

        # Check if the file_type is "sell" and apply the filters accordingly
        if filter_entry.get("file_type") == "sell":
            filter_entry.pop("file_type")

            # Apply the filters to the Sell model and check for the count parameter
            files = Sell.objects.filter(**filter_entry)
            if 'count' in params:
                # If count is requested, return the count of matching records
                count = files.count()
                return Response({"count": count})
            serializer = SellFileSerializer(files, many=True)
            return Response(serializer.data)

        # Similar logic for "rent" file_type
        elif filter_entry.get("file_type") == "rent":
            filter_entry.pop("file_type")

            files = Rent.objects.filter(**filter_entry)
            if 'count' in params:
                count = files.count()
                return Response({"count": count})
            serializer = RentFileSerializer(files, many=True)
            return Response(serializer.data)
        else:
            # Handle cases where file_type is neither "sell" nor "rent"
            print(filter_entry)
            sell_files = Sell.objects.filter(**filter_entry)
            rent_files = Rent.objects.filter(**filter_entry)
            if 'count' in params:
                # Calculate the total count across both models
                count = sell_files.count() + rent_files.count()
                return Response({"count": count})
            sell_serializer = SellFileSerializer(sell_files, many=True)
            rent_serializer = RentFileSerializer(rent_files, many=True)
            return Response(list(chain(sell_serializer.data, rent_serializer.data)))





class CustomerFilter(APIView):
    def get(self, request, *args, **kwargs):
        # Copy the original query parameters to avoid modifying the original request
        params = request.query_params.copy()
        
        # Define the allowed fields for filtering
        filter_fields = [
            "id",
            "customer_name",
            "customer_type",
            "property_type",
            "budget__lte",
            "budget__gte",
            "budget_up__lte",
            "budget_up__gte",
            "budget_rent__lte",
            "budget_rent__gte",
            "m2__lte",
            "bedroom__lte",
            "year__lte",
            "parking",
            "elevator",
            "storage",
            "status",
        ]
        
        # Define integer and boolean filter fields
        int_filter_fields = [
            "budget__lte",
            "budget__gte",
            "budget_up__lte",
            "budget_up__gte",
            "budget_rent__lte",
            "budget_rent__gte",
            "m2__lte",
            "bedroom__lte",
            "year__lte",
            "id",
        ]
        bool_filter_fields = [
            "parking",
            "elevator",
            "storage",
        ]

        # Initialize an empty dictionary to hold the filter entries
        filter_entry = {}

        # Iterate over all filter fields and populate the filter_entry dictionary
        for field in filter_fields:
            param = params.get(field)
            if param:
                if field in int_filter_fields:
                    param = float(param)
                elif field in bool_filter_fields:
                    param = bool(param)

                filter_entry[field] = param

        # Check if the customer_type is "buy" and apply the filters accordingly
        if filter_entry.get("customer_type") == "buy":
            filter_entry.pop("customer_type")
            customers = BuyCustomer.objects.filter(**filter_entry)
            if 'count' in params:
                # If count is requested, return the count of matching records
                count = customers.count()
                return Response({"count": count})
            serializer = BuyCustomerSerializer(customers, many=True)
            return Response(serializer.data)

        # Similar logic for "rent" customer_type
        elif filter_entry.get("customer_type") == "rent":
            filter_entry.pop("customer_type")
            customers = RentCustomer.objects.filter(**filter_entry)
            if 'count' in params:
                count = customers.count()
                return Response({"count": count})
            serializer = RentCustomerSerializer(customers, many=True)
            return Response(serializer.data)
        else:
            # Handle cases where customer_type is neither "buy" nor "rent"
            buy_customers = BuyCustomer.objects.filter(**filter_entry)
            rent_customers = RentCustomer.objects.filter(**filter_entry)
            if 'count' in params:
                # Calculate the total count across both models
                count = buy_customers.count() + rent_customers.count()
                return Response({"count": count})
            buy_serializer = BuyCustomerSerializer(buy_customers, many=True)
            rent_serializer = RentCustomerSerializer(rent_customers, many=True)
            customers = list(chain(buy_serializer.data, rent_serializer.data))
            return Response(customers)

        return Response(serializer.data)



#!SECTION
