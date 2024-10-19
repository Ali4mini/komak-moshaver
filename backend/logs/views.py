from rest_framework import generics
from .models import SellCall, RentCall, SellTour, RentTour
from .serializers import (
    RentTourSerializer,
    SellCallSerializer,
    RentCallSerializer,
    SellTourSerializer,
)

# Create your views here.


class SellCallView(generics.ListCreateAPIView):
    queryset = SellCall.objects.all()
    serializer_class = SellCallSerializer


class RentCallView(generics.ListCreateAPIView):
    queryset = RentCall.objects.all()
    serializer_class = RentCallSerializer


class SellTourView(generics.ListCreateAPIView):
    queryset = SellTour.objects.all()
    serializer_class = SellTourSerializer


class RentTourView(generics.ListCreateAPIView):
    queryset = RentTour.objects.all()
    serializer_class = RentTourSerializer
