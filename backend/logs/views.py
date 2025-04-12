from rest_framework import generics, status
from rest_framework.views import APIView
from rest_framework.response import Response
from .models import SellCall, RentCall, SellTour, RentTour, SMSLog
from .serializers import (
    RentTourSerializer,
    SellCallSerializer,
    RentCallSerializer,
    SellTourSerializer,
    SMSLogSerializer,
)

# Create your views here.


class SMSLogResend(APIView):
    def post(self, request, pk):
        try:
            smslog = SMSLog.objects.get(id=pk)
            smslog.resend_sms()
            return Response("re-sent the SMS message", status=status.HTTP_200_OK)
        except Exception as e:
            print(f"Error in resending smslog with id {pk}: {e}")
            return Response(
                "failed to resend", status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )


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
