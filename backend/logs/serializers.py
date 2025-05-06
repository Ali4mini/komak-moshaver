from rest_framework import serializers
from .models import SellCall, RentCall, SellTour, RentTour, SMSLog
from utils.common import set_added_by
# serializers.py
from rest_framework import serializers
from .models import Call

class CallSerializer(serializers.ModelSerializer):
    person_name = serializers.CharField(source='person.get_full_name', read_only=True)
    phone_number = serializers.CharField(read_only=True)  # Ensure it's not writable
    is_transcript_correct_show = serializers.SerializerMethodField()
    duration_formatted = serializers.SerializerMethodField()
    location = serializers.JSONField(required=False)
    
    class Meta:
        model = Call
        fields = [
            'id',
            'person',
            'person_name',
            'phone_number',
            'call_type',
            'call_status',
            'start_time',
            'end_time',
            'duration',
            'duration_formatted',
            'location',
            'recording_file',
            'is_transcript_correct',
            'is_transcript_correct_show',
            'recording_transcription',
            'created_at',
            'updated_at'
        ]
        extra_kwargs = {
            'person': {'required': False},
            'recording_file': {'required': False}
        }
    
    def get_is_transcript_correct_show(self, obj):
        """Return duration in MM:SS format"""
        if obj.is_transcript_correct:
            return "correct"
        return "incorrect"

    def get_duration_formatted(self, obj):
        """Return duration in MM:SS format"""
        if obj.duration:
            minutes = obj.duration // 60
            seconds = obj.duration % 60
            return f"{minutes:02d}:{seconds:02d}"
        return None
    
    def validate(self, data):
        """Custom validation for call data"""
        if data.get('end_time') and data.get('start_time'):
            if data['end_time'] < data['start_time']:
                raise serializers.ValidationError("End time must be after start time")
        return data

class SMSLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = SMSLog
        fields = "__all__"


@set_added_by
class SellCallSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=100, write_only=True)

    class Meta:
        model = SellCall
        exclude = ("added_by",)


@set_added_by
class RentCallSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=100, write_only=True)

    class Meta:
        model = RentCall
        exclude = ("added_by",)


@set_added_by
class SellTourSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=100, write_only=True)

    class Meta:
        model = SellTour
        exclude = ("added_by",)


@set_added_by
class RentTourSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=100, write_only=True)

    class Meta:
        model = RentTour
        exclude = ("added_by",)
