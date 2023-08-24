from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from . import forms
from django.contrib import messages
from django.views import View
from .models import BuyCustomer, RentCustomer
from itertools import chain
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.generic.edit import UpdateView, DeleteView
from rest_framework.views import APIView
from rest_framework import generics
from rest_framework.response import Response
from .serializers import BuyCustomerSerializer, RentCustomerSerializer
# Create your views here.

#SECTION - API
class BuyCustomerDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = BuyCustomer.objects.all()
    serializer_class = BuyCustomerSerializer
    def destroy(self, request, pk=None):
        print('in delete')
        customer = self.get_object()
        customer.status = "UNACTIVE"
        customer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class RentCustomerDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = RentCustomer.objects.all()
    serializer_class = RentCustomerSerializer
    def destroy(self, request, pk=None):
        print('in delete')
        customer = self.get_object()
        customer.status = "UNACTIVE"
        customer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

class NewBuyCustomer(generics.CreateAPIView):
    queryset = BuyCustomer.objects.all()
    serializer_class = BuyCustomerSerializer

class NewRentCustomer(generics.CreateAPIView):
    queryset = RentCustomer.objects.all()
    serializer_class = RentCustomerSerializer


#!SECTION
