from rest_framework import serializers
from .models import Sell, Rent, SellImage, RentImage
from utils.common import set_added_by, set_updated_logic
import jdatetime
import requests
from django.core.files.base import ContentFile


class SellImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = SellImage
        fields = ["image_url", "file"]  # Include other fields as needed

    def get_image_url(self, obj):
        request = self.context.get("request")
        if request is not None:
            print("\nobj.image: ", obj.image)
            return request.build_absolute_uri(obj.image.url)

        return None


class RentImageSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = RentImage
        fields = ["image_url", "file"]  # Include other fields as needed

    def get_image_url(self, obj):
        request = self.context.get("request")
        if request is not None:
            return request.build_absolute_uri(obj.image.url)

        return None


@set_added_by
@set_updated_logic
class SellFileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=100, write_only=True)
    file_type = serializers.SerializerMethodField()
    file_date = serializers.SerializerMethodField()
    persian_created = serializers.SerializerMethodField()
    persian_updated = serializers.SerializerMethodField()
    added_by = serializers.SerializerMethodField()

    class Meta:
        model = Sell
        fields = "__all__"

    def get_file_type(self, obj):
        return "sell"

    def get_added_by(self, obj):
        user = obj.added_by
        return user.username

    def get_persian_created(self, obj):
        if obj.created:
            jalali_date = jdatetime.date.fromgregorian(date=obj.created)
            return jalali_date.strftime("%Y/%m/%d")

    def get_persian_updated(self, obj):
        if obj.updated:
            jalali_date = jdatetime.date.fromgregorian(date=obj.updated)
            return jalali_date.strftime("%Y/%m/%d")

    def get_file_date(self, obj):
        if obj.date:
            jalali_date = jdatetime.date.fromgregorian(date=obj.date)
            return jalali_date.strftime("%Y/%m/%d")


@set_added_by
@set_updated_logic
class RentFileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=100, write_only=True)
    file_type = serializers.SerializerMethodField()
    file_date = serializers.SerializerMethodField()
    persian_created = serializers.SerializerMethodField()
    persian_updated = serializers.SerializerMethodField()
    added_by = serializers.SerializerMethodField()

    class Meta:
        model = Rent
        fields = "__all__"

    def get_file_type(self, obj):
        return "rent"

    def get_added_by(self, obj):
        user = obj.added_by
        return user.username

    def get_persian_created(self, obj):
        if obj.created:
            jalali_date = jdatetime.date.fromgregorian(date=obj.created)
            return jalali_date.strftime("%Y/%m/%d")

    def get_persian_updated(self, obj):
        if obj.updated:
            jalali_date = jdatetime.date.fromgregorian(date=obj.updated)
            return jalali_date.strftime("%Y/%m/%d")

    def get_file_date(self, obj):
        if obj.date:
            jalali_date = jdatetime.date.fromgregorian(date=obj.date)
            return jalali_date.strftime("%Y/%m/%d")
