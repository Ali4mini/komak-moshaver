from rest_framework import serializers
from .models import SellCall, RentCall
from agents_m.models import Profile

class SellCallSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=100, write_only=True)
    class Meta:
        model = SellCall
        exclude = ("added_by", )

    def create(self, validated_data):
        username = validated_data.pop("username")
        profile = Profile.objects.get(user__username=username)
        validated_data["added_by"] = profile.user
        return super().create(validated_data)

class RentCallSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=100, write_only=True)
    class Meta:
        model = RentCall
        exclude = ("added_by", )

    def create(self, validated_data):
        username = validated_data.pop("username")
        profile = Profile.objects.get(user__username=username)
        validated_data["added_by"] = profile.user
        return super().create(validated_data)
