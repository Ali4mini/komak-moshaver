from django.shortcuts import render
from . import forms
from file.models import Sell, Rent
from customer.models import BuyCustomer, RentCustomer
from django.views import View
from django.http import HttpResponse
from .forms import SellFilter
from itertools import chain
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from file.serializers import SellFileSerializer, RentFileSerializer
from customer.serializers import BuyCustomerSerializer, RentCustomerSerializer
# Create your views here.

#SECTION - API
class FileFilter(APIView):
    def get(self, request, *args, **kwargs):
        params = request.query_params.copy()

        filter_fields = ['id',
                        'owner_name',
                        'file_type',
                        'property_type',
                        'price__lte',
                        'price_up__lte', 
                        'price_rent__lte',
                        'm2__gte',
                        'bedroom__gte',
                        'year__gte',
                        'parking',
                        'elevator',
                        'storage',
                        ]

        int_filter_fields = ['price__lte',
                             'price_up__lte', 
                             'price_rent__lte',
                             'm2__gte',
                             'bedroom__gte',
                             'year__gte',
                             'id',
                            ]

        bool_filter_fields = ['parking',
                              'elevator',
                              'storage',
                              ]

        filter_entery = {}  
        for field in filter_fields:
            param = params.get(field)
            if param:
                if field in int_filter_fields:
                    param = int(param)
                elif field in bool_filter_fields:
                    param = bool(param)
                
                filter_entery[field] = param
        
        if filter_entery.get('file_type') == 'sell':
            filter_entery.pop('file_type')
            # filter_entery.pop('price_up__lte')
            # filter_entery.pop('price_rent__lte')

            files = Sell.objects.filter(**filter_entery).all()
            serializer = SellFileSerializer(files, many=True)

        elif filter_entery.get('file_type') == 'rent':
            filter_entery.pop('file_type')
            # filter_entery.pop('price__lte')
            

            files = Rent.objects.filter(**filter_entery).all()
            serializer = RentFileSerializer(files, many=True)
        else:
            sell_files = Sell.objects.filter(**filter_entery).all()
            sell_files = SellFileSerializer(sell_files, many=True)
            rent_files = Rent.objects.filter(**filter_entery).all()
            rent_files = RentFileSerializer(rent_files, many=True)
            return Response(list(chain(sell_files.data, rent_files.data)))

        return Response(serializer.data)

class CustomerFilter(APIView):
    def get(self, request, *args, **kwargs):
        params = request.query_params.copy()
        filter_fields = ['id',
                        'customer_name',
                        'customer_type',
                        'property_type',
                        'budget__gte',
                        'up_budget__gte', 
                        'rent_budget__gte',
                        'm2__lte',
                        'bedroom__lte',
                        'year__lte',
                        'parking',
                        'elevator',
                        'storage',
                        ]

        int_filter_fields = ['budget__gte',
                             'up_budget__gte', 
                             'rent_budget__gte',
                             'm2__lte',
                             'bedroom__lte',
                             'year__lte',
                             'id',
                            ]

        bool_filter_fields = ['parking',
                              'elevator',
                              'storage',
                              ]

        filter_entery = {}  
        for field in filter_fields:
            param = params.get(field)
            if param:
                if field in int_filter_fields:
                    param = int(param)
                elif field in bool_filter_fields:
                    param = bool(param)
                
                filter_entery[field] = param

        if filter_entery.get('customer_type') == 'buy':
            filter_entery.pop('customer_type')
            customers = BuyCustomer.objects.filter(**filter_entery).all()
            serializer = BuyCustomerSerializer(customers, many=True)

        elif filter_entery.get('customer_type') == 'rent':
            filter_entery.pop('customer_type')
            customers = RentCustomer.objects.filter(**filter_entery).all()
            serializer = RentCustomerSerializer(customers, many=True)

        else:
            buy_customers = BuyCustomer.objects.filter(**filter_entery).all()
            buy_customers = BuyCustomerSerializer(buy_customers, many=True)
            rent_customers = RentCustomer.objects.filter(**filter_entery).all()
            rent_customers = RentCustomerSerializer(rent_customers, many=True)
            customers = list(chain(buy_customers.data, rent_customers.data))
            return Response(customers)

        return Response(serializer.data)

    
#!SECTION
