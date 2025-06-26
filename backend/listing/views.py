from file.models import Sell, Rent
from customer.models import BuyCustomer, RentCustomer
from itertools import chain
from rest_framework.views import APIView
from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from file.serializers import SellFileSerializer, RentFileSerializer
from django.db.models.query import Q
from customer.serializers import BuyCustomerSerializer, RentCustomerSerializer
from typing import List, Dict, Any
from datetime import date, timedelta
from datetime import datetime  # Import datetime
from itertools import chain
from typing import List, Dict, Any
from rest_framework.views import APIView
from rest_framework.response import Response
import pytz

# Create your views here.


# SECTION - API
# Define a basic pagination class
class BasicPagination(PageNumberPagination):
    page_size = 10  # Default page size
    page_size_query_param = (
        "page_size"  # Query parameter to override the default page size
    )


class RentFileRestore(APIView, BasicPagination):
    def get(self, request, *args, **kwargs):

        params = request.query_params.copy()

        today = date.today()
        # Filter based on the updated field
        queryset = Rent.objects.filter(
            date__month=today.month,
            date__year__lt=today.year,
            # updated__gte=last_update_date,
        )

        # Apply pagination to the queryset
        paginated_queryset = self.paginate_queryset(queryset, request, view=self)

        if "count" in params:
            count = queryset.count()
            return Response({"count": count})

        # Serialize the paginated queryset
        serializer = RentFileSerializer(paginated_queryset, many=True)

        # Return the paginated response
        return self.get_paginated_response(serializer.data)


# TODO: add urls for this view
class CustomerFileRestore(APIView, BasicPagination):
    def get(self, request, *args, **kwargs):

        today = date.today()
        queryset = RentCustomer.objects.filter(
            date__month=today.month, date__year__lt=today.year
        )

        # Apply pagination to the queryset
        paginated_queryset = self.paginate_queryset(queryset, request, view=self)

        # Serialize the paginated queryset
        serializer = RentCustomerSerializer(paginated_queryset, many=True)

        # Return the paginated response
        return self.get_paginated_response(serializer.data)


class FileFilter(APIView, BasicPagination):
    def get(self, request, *args, **kwargs) -> Response:
        params = request.query_params.copy()
        filter_fields = self._define_filter_fields()

        # _populate_filter_entries now handles the __date lookup internally
        filter_entry = self._populate_filter_entries(params, filter_fields)

        file_type = filter_entry.pop(
            "file_type", None
        )  # file_type is removed from filter_entry if present
        if file_type == "sell":
            return self._process_sell_filters(request, filter_entry, params)
        elif file_type == "rent":
            return self._process_rent_filters(request, filter_entry, params)
        else:
            return self._handle_other_file_types(request, filter_entry, params)

    def _define_filter_fields(self) -> List[str]:
        return [
            "id",
            "owner_name",
            "owner_name__icontains",
            "file_type",  # Used for routing, not direct model filtering unless model has it
            "property_type",
            "price__lte",
            "price__gte",
            "price_up__lte",  # Assuming these are specific fields in your models
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
            "created__date__gte",  # Added for filtering
            "created__date__lte",  # Added for filtering
            "created__date__gt",  # Added for filtering
            "created__date__lt",  # Added for filtering
        ]

    def _populate_filter_entries(
        self, params: Dict[str, str], filter_fields: List[str]
    ) -> Dict[str, Any]:
        filter_entry = {}
        for (
            field_lookup_key
        ) in filter_fields:  # Renamed 'field' to 'field_lookup_key' for clarity
            param_value = params.get(field_lookup_key)
            if param_value:
                processed_value = param_value  # Store the potentially processed value
                actual_filter_key = (
                    field_lookup_key  # This might change for date fields
                )

                # Handle numeric fields
                if field_lookup_key in [
                    "price__lte",
                    "price__gte",
                    "price_up__lte",
                    "price_up__gte",
                    "price_rent__lte",
                    "price_rent__gte",
                    "m2__gte",
                    "bedroom__gte",
                    "year__gte",
                ]:
                    try:
                        processed_value = float(param_value)
                    except ValueError:
                        print(
                            f"Warning: Invalid float value for {field_lookup_key}: {param_value}"
                        )
                        continue  # Skip this filter
                # Handle boolean fields
                elif field_lookup_key in ["parking", "elevator", "storage"]:
                    if param_value.lower() in ("true", "1", "yes"):
                        processed_value = True
                    elif param_value.lower() in ("false", "0", "no"):
                        processed_value = False
                    else:
                        print(
                            f"Warning: Invalid boolean value for {field_lookup_key}: {param_value}"
                        )
                        continue  # Skip this filter
                # Handle date fields (assuming 'created_date' on models is DateTimeField)
                elif field_lookup_key in ["created__gte", "created__lte"]:
                    try:
                        date_obj = datetime.strptime(param_value, "%Y-%m-%d").date()
                        processed_value = date_obj
                        # Adjust the filter key to use __date for DateTimeField comparison
                        if field_lookup_key == "created__gte":
                            actual_filter_key = "created__date__gte"
                        elif field_lookup_key == "created__lte":
                            actual_filter_key = "created__date__lte"
                    except ValueError:
                        print(
                            f"Warning: Invalid date value for {field_lookup_key}: {param_value}. Expected YYYY-MM-DD."
                        )
                        continue  # Skip this filter

                filter_entry[actual_filter_key] = processed_value
        return filter_entry

    def _process_sell_filters(
        self,
        request: Any,  # request is actually rest_framework.request.Request
        filter_entry: Dict[str, Any],
        params: Dict[str, str],
    ) -> Response:
        # Ensure Sell model has 'created_date' field (DateTimeField)
        files = Sell.objects.filter(**filter_entry)
        if "count" in params:
            count = files.count()
            return Response({"count": count})
        results = self.paginate_queryset(files, request, view=self)
        serializer = SellFileSerializer(results, many=True)
        return self.get_paginated_response(serializer.data)

    def _process_rent_filters(
        self,
        request: Any,  # request is actually rest_framework.request.Request
        filter_entry: Dict[str, Any],
        params: Dict[str, str],
    ) -> Response:
        # Ensure Rent model has 'created_date' field (DateTimeField)
        files = Rent.objects.filter(**filter_entry)
        if "count" in params:
            count = files.count()
            return Response({"count": count})
        results = self.paginate_queryset(files, request, view=self)
        serializer = RentFileSerializer(results, many=True)
        return self.get_paginated_response(serializer.data)

    def _handle_other_file_types(
        self,
        request: Any,  # request is actually rest_framework.request.Request
        filter_entry: Dict[str, Any],
        params: Dict[str, str],
    ) -> Response:
        # Ensure both models have 'created_date' field if filtering by it
        sell_files = Sell.objects.filter(**filter_entry)
        rent_files = Rent.objects.filter(**filter_entry)

        if "count" in params:
            count = sell_files.count() + rent_files.count()
            return Response({"count": count})

        sell_results = self.paginate_queryset(sell_files, request, view=self)
        rent_results = self.paginate_queryset(rent_files, request, view=self)

        sell_serializer = SellFileSerializer(sell_results, many=True)
        rent_serializer = RentFileSerializer(rent_results, many=True)

        combined_data = list(chain(sell_serializer.data, rent_serializer.data))
        return Response(combined_data)


class CustomerFilter(APIView, BasicPagination):
    def get(self, request, *args, **kwargs) -> Response:
        params = request.query_params.copy()
        filter_fields = self._define_filter_fields()

        filter_entry = self._populate_filter_entries(params, filter_fields)

        customer_type = filter_entry.pop("customer_type", None)
        if customer_type == "buy":
            return self._process_buy_filters(request, filter_entry, params)
        elif customer_type == "rent":
            return self._process_rent_filters(request, filter_entry, params)
        else:
            return self._handle_other_customer_types(request, filter_entry, params)

    def _define_filter_fields(self) -> List[str]:
        return [
            "id",
            "customer_name",
            "customer_name__icontains",
            "customer_type",
            "property_type",
            "budget__lte",
            "budget__gte",
            "up_budget__lte",  # Note: Mismatch with _populate_filter_entries (budget_up vs up_budget)
            "up_budget__gte",  # I'll assume it should be "up_budget" based on this list
            "rent_budget__lte",  # Note: Mismatch (budget_rent vs rent_budget)
            "rent_budget__gte",  # I'll assume it should be "rent_budget"
            "m2__lte",
            "bedroom__lte",
            "year__lte",
            "parking",
            "elevator",
            "storage",
            "status",
            "created__date__gte",  # Added for filtering
            "created__date__lte",  # Added for filtering
            "created__date__gt",  # Added for filtering
            "created__date__lt",  # Added for filtering
        ]

    def _populate_filter_entries(
        self, params: Dict[str, str], filter_fields: List[str]
    ) -> Dict[str, Any]:
        filter_entry = {}
        for field in filter_fields:
            param_value = params.get(
                field
            )  # Renamed from param to param_value to avoid confusion
            if param_value:
                # Handle numeric fields
                if field in [
                    "budget__lte",
                    "budget__gte",
                    "up_budget__lte",  # Corrected to match _define_filter_fields
                    "up_budget__gte",  # Corrected
                    "rent_budget__lte",  # Corrected
                    "rent_budget__gte",  # Corrected
                    "m2__lte",
                    "bedroom__lte",
                    "year__lte",
                ]:
                    try:
                        param_value = float(param_value)
                    except ValueError:
                        # Handle or log error if param_value is not a valid float
                        print(
                            f"Warning: Invalid float value for {field}: {param_value}"
                        )
                        continue  # Skip this filter
                # Handle boolean fields
                elif field in ["parking", "elevator", "storage"]:
                    # A more robust way to handle boolean strings
                    if param_value.lower() in ("true", "1", "yes"):
                        param_value = True
                    elif param_value.lower() in ("false", "0", "no"):
                        param_value = False
                    else:
                        # Handle or log error if param_value is not a valid boolean string
                        print(
                            f"Warning: Invalid boolean value for {field}: {param_value}"
                        )
                        continue  # Skip this filter
                # Handle date fields
                elif field in ["created__gte", "created__lte"]:
                    try:
                        # Assuming date format is YYYY-MM-DD
                        # If your models use DateTimeField, this will work fine for date-based lookups.
                        # If you need time precision, parse accordingly and ensure your model field supports it.
                        param_value = datetime.strptime(param_value, "%Y-%m-%d").date()
                    except ValueError:
                        # Handle or log error if param_value is not a valid date string
                        print(
                            f"Warning: Invalid date value for {field}: {param_value}. Expected YYYY-MM-DD."
                        )
                        continue  # Skip this filter

                filter_entry[field] = param_value
        return filter_entry

    def _process_buy_filters(
        self,
        request: Any,  # request is actually rest_framework.request.Request
        filter_entry: Dict[str, Any],
        params: Dict[str, str],
    ) -> Response:
        # Ensure BuyCustomer model has a 'created_date' field (DateField or DateTimeField)
        customers = BuyCustomer.objects.filter(**filter_entry)
        if "count" in params:
            count = customers.count()
            return Response({"count": count})
        results = self.paginate_queryset(customers, request, view=self)
        serializer = BuyCustomerSerializer(results, many=True)
        return self.get_paginated_response(serializer.data)

    def _process_rent_filters(
        self,
        request: Any,  # request is actually rest_framework.request.Request
        filter_entry: Dict[str, Any],
        params: Dict[str, str],
    ) -> Response:
        # Ensure RentCustomer model has a 'created_date' field (DateField or DateTimeField)
        customers = RentCustomer.objects.filter(**filter_entry)
        if "count" in params:
            count = customers.count()
            return Response({"count": count})
        results = self.paginate_queryset(customers, request, view=self)
        serializer = RentCustomerSerializer(results, many=True)
        return self.get_paginated_response(serializer.data)

    def _handle_other_customer_types(
        self,
        request: Any,  # request is actually rest_framework.request.Request
        filter_entry: Dict[str, Any],
        params: Dict[str, str],
    ) -> Response:
        # Ensure both models have 'created_date' field if filtering by it
        buy_customers = BuyCustomer.objects.filter(**filter_entry)
        rent_customers = RentCustomer.objects.filter(**filter_entry)

        if "count" in params:
            count = buy_customers.count() + rent_customers.count()
            return Response({"count": count})

        # --- Note on Pagination for combined results ---
        # The current approach paginates buy_customers and rent_customers separately
        # and then concatenates the *already paginated* results.
        # This means if your page size is 10, you might get up to 10 buy + 10 rent customers.
        # For true combined pagination (e.g., a single list of 10 mixed customers sorted by some common field):
        # 1. You'd typically fetch all (or a larger set of) matching customers.
        # 2. Serialize them.
        # 3. Combine the serialized data into a single list.
        # 4. Sort this list if necessary (e.g., by 'created_date' if that's desired for ordering).
        # 5. Manually apply pagination to this combined list of dictionaries.
        # This is more complex. The current code keeps them separate until the final concatenation.
        # For simplicity, I'm leaving this part as is, as your request was about filtering.

        buy_results = self.paginate_queryset(buy_customers, request, view=self)
        rent_results = self.paginate_queryset(rent_customers, request, view=self)

        buy_serializer = BuyCustomerSerializer(buy_results, many=True)
        rent_serializer = RentCustomerSerializer(rent_results, many=True)

        # This returns a list of paginated buy data followed by paginated rent data.
        # It's not a single paginated list of combined data.
        combined_data = list(chain(buy_serializer.data, rent_serializer.data))
        return Response(combined_data)
