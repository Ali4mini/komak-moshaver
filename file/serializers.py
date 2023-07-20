from rest_framework import serializers
from .models import Sell, Rent

class SellFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sell
        fields = '__all__'

class RentFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rent
        fields = '__all__'

