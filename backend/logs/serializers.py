from rest_framework import serializers
from .models import SellCall, RentCall, SellTour, RentTour
from utils.common import set_added_by


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
