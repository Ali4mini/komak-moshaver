from django.shortcuts import render
from rest_framework import generics
from .models import SellCall, RentCall
from .serializers import SellCallSerializer, RentCallSerializer

# Create your views here.


class SellCallView(generics.ListCreateAPIView):
    queryset = SellCall.objects.all()
    serializer_class = SellCallSerializer

class RentCallView(generics.ListCreateAPIView):
    queryset = RentCall.objects.all()
    serializer_class = RentCallSerializer
