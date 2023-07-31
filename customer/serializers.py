from rest_framework import serializers
from .models import BuyCustomer, RentCustomer

class BuyCustomerSerializer(serializers.ModelSerializer):
    customer_type = serializers.SerializerMethodField()

    class Meta:
        model = BuyCustomer
        fields = '__all__'

    def get_customer_type(self, obj):
        return 'buy'

class RentCustomerSerializer(serializers.ModelSerializer):
    customer_type = serializers.SerializerMethodField()

    class Meta:
        model = RentCustomer
        fields = '__all__'

    def get_customer_type(self, obj):
        return 'rent'