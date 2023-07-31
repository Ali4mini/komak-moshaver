from django.shortcuts import render, get_object_or_404, redirect
from . import forms
from django.views.decorators.csrf import csrf_exempt
from .models import Sell, Rent, SellImages
from django.contrib import messages
from django.urls import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.generic.edit import UpdateView, DeleteView
from django.views import View
from django.utils.decorators import method_decorator
import requests
from rest_framework import generics
from rest_framework.views import APIView
from .serializers import SellFileSerializer, RentFileSerializer
from rest_framework.response import Response
from django.conf import settings
# Create your views here.

#SECTION - API
class SellFileDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sell.objects.all()
    serializer_class = SellFileSerializer

class RentFileDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = Rent.objects.all()
    serializer_class = RentFileSerializer

class NewSellFile(generics.CreateAPIView):
    queryset = Sell.objects.all()
    serializer_class = SellFileSerializer

class NewRentFile(generics.CreateAPIView):
    queryset = Rent.objects.all()
    serializer_class = RentFileSerializer

class SellSendInfo(APIView):
    def post(self, request, pk):
        phone_numbers = request.data.get('phone_numbers')
        file = Sell.objects.get(pk=pk)

        if file.elevator:
            elevator = 'دارد'
        else:
            elevator = 'ندارد'
        if file.storage:
            storage = 'دارد'
        else:
            storage = 'ندارد'
        if file.parking:
            parking = 'دارد'
        else:
            parking = 'ندارد'
            
        sell_template = f'''
        آدرس : {file.address}
        متراژ: {file.m2}
        قیمت: {file.price}
        طبقه: {file.floor}
        آسانسور: {elevator}
        پارکینگ: {parking}
        انباری: {storage}
        '''

        data = {'from':'50004001845778', 'to':phone_numbers, 'text':sell_template, 'udh':''}
        response = requests.post(settings.SMS_API, json=data)
        return Response(response)
        

#!SECTION







