from rest_framework import serializers
from .models import BuyCustomer, RentCustomer
from agents_m.models import Profile


class BuyCustomerSerializer(serializers.ModelSerializer):
    customer_type = serializers.SerializerMethodField()
    username = serializers.CharField(max_length=100, write_only=True)

    class Meta:
        model = BuyCustomer
        exclude = ("added_by",)  # Exclude the 'added_by' field

    def get_customer_type(self, obj):
        return "buy"

    def create(self, validated_data):
        print(validated_data)
        username = validated_data.pop("username")
        profile = Profile.objects.get(user__username=username)
        validated_data["added_by"] = profile.user
        return super().create(validated_data)


class RentCustomerSerializer(serializers.ModelSerializer):
    customer_type = serializers.SerializerMethodField()
    username = serializers.CharField(max_length=100, write_only=True)

    class Meta:
        model = RentCustomer
        exclude = ("added_by",)  # Exclude the 'added_by' field

    def get_customer_type(self, obj):
        return "rent"

    def create(self, validated_data):
        print(validated_data)
        username = validated_data.pop("username")
        profile = Profile.objects.get(user__username=username)
        validated_data["added_by"] = profile.user
        return super().create(validated_data)

