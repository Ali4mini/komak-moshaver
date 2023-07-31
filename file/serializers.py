from rest_framework import serializers
from .models import Sell, Rent

class SellFileSerializer(serializers.ModelSerializer):
    file_type = serializers.SerializerMethodField()

    class Meta:
        model = Sell
        fields = '__all__'

    def get_file_type(self, obj):
        return 'sell'

class RentFileSerializer(serializers.ModelSerializer):
    file_type = serializers.SerializerMethodField()

    class Meta:
        model = Rent
        fields = '__all__' 

    def get_file_type(self, obj):
        return 'rent'

