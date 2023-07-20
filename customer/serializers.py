from rest_framework import serializers
from .models import BuyCustomer, RentCustomer

class BuyCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuyCustomer
        fields = '__all__'

class RentCustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = RentCustomer
        fields = '__all__'