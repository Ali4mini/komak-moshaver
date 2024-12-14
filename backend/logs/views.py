from rest_framework import generics
from .models import SellCall, RentCall, SellTour, RentTour, SMSLog
from .serializers import (
    RentTourSerializer,
    SellCallSerializer,
    RentCallSerializer,
    SellTourSerializer,
    SMSLogSerializer,
)

# Create your views here.


class SMSLogView(generics.ListCreateAPIView):
    queryset = SMSLog.objects.all()
    serializer_class = SMSLogSerializer

    def get_queryset(self):
        return self.queryset.order_by("-id")


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
