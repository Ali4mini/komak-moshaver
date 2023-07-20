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
        data = request.data
        print(data)
        if data.get('file_type') == 'sell':
            data.pop('file_type')
            files = Sell.objects.filter(**data).all()
            serializer = SellFileSerializer(files, many=True)

        elif data.get('file_type') == 'rent':
            data.pop('file_type')
            files = Rent.objects.filter(**data).all()
            serializer = RentFileSerializer(files, many=True)
        else:
            sell_files = Sell.objects.filter(**data).all(   )
            sell_files = SellFileSerializer(sell_files, many=True)
            rent_files = Rent.objects.filter(**data).all()
            rent_files = RentFileSerializer(rent_files, many=True)
            return Response(list(chain(sell_files.data, rent_files.data)))

        return Response(serializer.data)

class CustomerFilter(APIView):
    def get(self, request, *args, **kwargs):
        data = request.query_params
        print(data)
        if data.get('customer_type') == 'buy':
            data.pop('customer_type')
            customers = BuyCustomer.objects.filter(**data).all()
            serializer = SellFileSerializer(customers, many=True)
            return Response(serializer.data)
        elif data.get('customer_type') == 'rent':
            data.pop('customer_type')
            customers = RentCustomer.objects.filter(**data).all()
            serializer = RentFileSerializer(customers, many=True)
            return Response(serializer.data)
        else:
            buy_customers = BuyCustomer.objects.filter(**data).all()
            buy_customers = BuyCustomerSerializer(buy_customers, many=True)
            rent_customers = RentCustomer.objects.filter(**data).all()
            rent_customers = RentCustomerSerializer(rent_customers, many=True)
            files = list(chain(buy_customers.data, rent_customers.data))
            return Response(files)
    
#!SECTION
