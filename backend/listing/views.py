from file.models import Sell, Rent
from customer.models import BuyCustomer, RentCustomer
from itertools import chain
from rest_framework.views import APIView
from rest_framework.pagination import  PageNumberPagination
from rest_framework.response import Response
from file.serializers import SellFileSerializer, RentFileSerializer
from customer.serializers import BuyCustomerSerializer, RentCustomerSerializer
from django.http import JsonResponse
from typing import List, Dict, Any

# Create your views here.


# SECTION - API
# Define a basic pagination class
class BasicPagination(PageNumberPagination):
    page_size = 10  # Default page size
    page_size_query_param = 'page_size'  # Query parameter to override the default page size

class FileFilter(APIView, BasicPagination):
    def get(self, request, *args, **kwargs) -> Response:
        params = request.query_params.copy()
        filter_fields = self._define_filter_fields()

        filter_entry = self._populate_filter_entries(params, filter_fields)

        file_type = filter_entry.pop('file_type', None)
        if file_type == 'sell':
            return self._process_sell_filters(request, filter_entry, params)
        elif file_type == 'rent':
            return self._process_rent_filters(request, filter_entry, params)
        else:
            return self._handle_other_file_types(request, filter_entry, params)

    def _define_filter_fields(self) -> List[str]:
        return [
            "id", "owner_name", "file_type", "property_type",
            "price__lte", "price__gte", "price_up__lte", "price_up__gte",
            "price_rent__lte", "price_rent__gte", "m2__gte", "bedroom__gte",
            "year__gte", "parking", "elevator", "storage", "status"
        ]

    def _populate_filter_entries(self, params: Dict[str, str], filter_fields: List[str]) -> Dict[str, Any]:
        filter_entry = {}
        for field in filter_fields:
            param = params.get(field)
            if param:
                if field in ["price__lte", "price__gte", "price_up__lte", "price_up__gte", "price_rent__lte", "price_rent__gte", "m2__gte", "bedroom__gte", "year__gte"]:
                    param = float(param)
                elif field in ["parking", "elevator", "storage"]:
                    param = bool(param)

                filter_entry[field] = param
        return filter_entry

    def _process_sell_filters(self,request: Dict[str, Any], filter_entry: Dict[str, Any], params: Dict[str, str]) -> Response:
        files = Sell.objects.filter(**filter_entry)
        if 'count' in params:
            count = files.count()
            return Response({"count": count})
        results = self.paginate_queryset(files, request, view=self)
        serializer = SellFileSerializer(results, many=True)
        return self.get_paginated_response(serializer.data)

    def _process_rent_filters(self,request: Dict[str, Any], filter_entry: Dict[str, Any], params: Dict[str, str]) -> Response:
        files = Rent.objects.filter(**filter_entry)
        if 'count' in params:
            count = files.count()
            return Response({"count": count})
        results = self.paginate_queryset(files, request, view=self)
        serializer = RentFileSerializer(results, many=True)
        return self.get_paginated_response(serializer.data)

    def _handle_other_file_types(self,request: Dict[str, Any], filter_entry: Dict[str, Any], params: Dict[str, str]) -> Response:
        sell_files = Sell.objects.filter(**filter_entry)
        rent_files = Rent.objects.filter(**filter_entry)
        if 'count' in params:
            count = sell_files.count() + rent_files.count()
            return Response({"count": count})
        sell_results = self.paginate_queryset(sell_files, request, view=self)
        rent_results = self.paginate_queryset(rent_files, request, view=self)
        sell_serializer = SellFileSerializer(sell_results, many=True)
        rent_serializer = RentFileSerializer(rent_results, many=True)
        return Response(list(chain(sell_serializer.data, rent_serializer.data)))


class CustomerFilter(APIView, BasicPagination):
    def get(self, request, *args, **kwargs) -> Response:
        params = request.query_params.copy()
        filter_fields = self._define_filter_fields()

        filter_entry = self._populate_filter_entries(params, filter_fields)

        customer_type = filter_entry.pop('customer_type', None)
        if customer_type == 'buy':
            return self._process_buy_filters(request, filter_entry, params)
        elif customer_type == 'rent':
            return self._process_rent_filters(request, filter_entry, params)
        else:
            return self._handle_other_customer_types(request, filter_entry, params)

    def _define_filter_fields(self) -> List[str]:
        return [
            "id", "customer_name", "customer_type", "property_type",
            "budget__lte", "budget__gte", "budget_up__lte", "budget_up__gte",
            "budget_rent__lte", "budget_rent__gte", "m2__lte", "bedroom__lte",
            "year__lte", "parking", "elevator", "storage", "status"
        ]

    def _populate_filter_entries(self, params: Dict[str, str], filter_fields: List[str]) -> Dict[str, Any]:
        filter_entry = {}
        for field in filter_fields:
            param = params.get(field)
            if param:
                if field in ["budget__lte", "budget__gte", "budget_up__lte", "budget_up__gte", "budget_rent__lte", "budget_rent__gte", "m2__lte", "bedroom__lte", "year__lte"]:
                    param = float(param)
                elif field in ["parking", "elevator", "storage"]:
                    param = bool(param)

                filter_entry[field] = param
        return filter_entry

    def _process_buy_filters(self, request: Dict[str, Any], filter_entry: Dict[str, Any], params: Dict[str, str]) -> Response:
        customers = BuyCustomer.objects.filter(**filter_entry)
        if 'count' in params:
            count = customers.count()
            return Response({"count": count})
        results = self.paginate_queryset(customers, request, view=self)
        serializer = BuyCustomerSerializer(results, many=True)
        return self.get_paginated_response(serializer.data)

    def _process_rent_filters(self, request: Dict[str, Any], filter_entry: Dict[str, Any], params: Dict[str, str]) -> Response:
        customers = RentCustomer.objects.filter(**filter_entry)
        if 'count' in params:
            count = customers.count()
            return Response({"count": count})
        results = self.paginate_queryset(customers, request, view=self)
        serializer = RentCustomerSerializer(results, many=True)
        return self.get_paginated_response(serializer.data)

    def _handle_other_customer_types(self, request: Dict[str, Any], filter_entry: Dict[str, Any], params: Dict[str, str]) -> Response:
        buy_customers = BuyCustomer.objects.filter(**filter_entry)
        rent_customers = RentCustomer.objects.filter(**filter_entry)
        if 'count' in params:
            count = buy_customers.count() + rent_customers.count()
            return Response({"count": count})
        buy_results = self.paginate_queryset(buy_customers, request, view=self)
        rent_results = self.paginate_queryset(rent_customers, request, view=self)
        buy_serializer = BuyCustomerSerializer(buy_results, many=True)
        rent_serializer = RentCustomerSerializer(rent_results, many=True)
        return Response(list(chain(buy_serializer.data, rent_serializer.data)))
