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
from rest_framework import viewsets, filters
from rest_framework.decorators import action
from .models import Call
from .serializers import CallSerializer
import os

class CallViewSet(viewsets.ModelViewSet):
    queryset = Call.objects.all().select_related('person')
    serializer_class = CallSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['call_type', 'call_status', 'person']
    search_fields = ['phone_number', 'person__first_name', 'person__last_name']
    ordering_fields = ['start_time', 'end_time', 'duration']
    ordering = ['-start_time']

    def get_queryset(self):
        queryset = super().get_queryset()
        person_id = self.request.query_params.get('person_id')
        if person_id:
            queryset = queryset.filter(person_id=person_id)
        return queryset

    def perform_create(self, serializer):
        """Automatically set phone_number from person if not provided"""
        person = serializer.validated_data.get('person')
        if person and not serializer.validated_data.get('phone_number'):
            serializer.validated_data['phone_number'] = person.phone_number
        serializer.save()

    @action(detail=False, methods=['post'])
    def sync_recordings(self, request):
        """Custom endpoint to trigger recording synchronization"""
        directory_path = request.data.get('directory_path', '/recordings')
        
        if not os.path.isdir(directory_path):
            return Response(
                {'error': f'Directory not found: {directory_path}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        persons, recordings, skipped = Call.sync_recordings(directory_path)
        return Response({
            'persons_created': persons,
            'recordings_created': recordings,
            'skipped_files': skipped
        })

    @action(detail=True, methods=['get'])
    def metadata(self, request, pk=None):
        """Get detailed metadata for a recording"""
        recording = self.get_object()
        return Response({
            'id': recording.id,
            'phone_number': recording.phone_number,
            'duration': recording.duration,
            'location': recording.location,
            'recording_url': request.build_absolute_uri(recording.recording_file.url) if recording.recording_file else None
        })


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
