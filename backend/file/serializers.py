from rest_framework import serializers
from .models import Sell, Rent, SellImage, RentImage
from django.contrib.auth import get_user_model
from agents_m.models import Profile


class SellImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = SellImage
        fields = ["image_url", "file"]  # Include other fields as needed

    def get_image_url(self, obj):
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class RentImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = RentImage
        fields = ["image_url", "file"]  # Include other fields as needed

    def get_image_url(self, obj):
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.image.url)
        return obj.image.url


class SellFileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=100, write_only=True)
    file_type = serializers.SerializerMethodField()

    class Meta:
        model = Sell
        exclude = ("added_by",)  # Exclude the 'added_by' field

    def get_file_type(self, obj):
        return "sell"

    def create(self, validated_data):
        username = validated_data.pop("username")
        profile = Profile.objects.get(user__username=username)
        validated_data["added_by"] = profile.user
        return super().create(validated_data)


class RentFileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=100, write_only=True)
    file_type = serializers.SerializerMethodField()

    class Meta:
        model = Rent
        fields = "__all__"

    def get_file_type(self, obj):
        return "rent"

    def create(self, validated_data):
        username = validated_data.pop("username")
        user = get_user_model().objects.get(username=username)
        validated_data["added_by"] = user
        return super().create(validated_data)
