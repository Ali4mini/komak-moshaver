from rest_framework import serializers
from .models import Person

class PersonSerializer(serializers.ModelSerializer):
    gender_display = serializers.CharField(source='get_gender_display', read_only=True)
    full_name = serializers.CharField(source='get_full_name', read_only=True)
    
    class Meta:
        model = Person
        fields = [
            'id',
            'first_name',
            'last_name',
            'full_name',
            'date_of_birth',
            'gender',
            'gender_display',
            'phone_number',
            'address',
            'last_contact',
            'notes',
            'created_at',
            'updated_at',
        ]
        extra_kwargs = {
            'gender': {'write_only': True},  # Only show display version in response
            'created_at': {'read_only': True},
            'updated_at': {'read_only': True},
        }
