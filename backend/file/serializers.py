from rest_framework import serializers
from .models import Sell, Rent, SellImage, RentImage


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
    file_type = serializers.SerializerMethodField()

    class Meta:
        model = Sell
        fields = "__all__"

    def get_file_type(self, obj):
        return "sell"


class RentFileSerializer(serializers.ModelSerializer):
    file_type = serializers.SerializerMethodField()

    class Meta:
        model = Rent
        fields = "__all__"

    def get_file_type(self, obj):
        return "rent"
