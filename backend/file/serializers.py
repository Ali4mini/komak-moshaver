from django.db.models import fields_all
from rest_framework import serializers
from .models import Sell, Rent, SellImage, RentImage
from django.contrib.auth import get_user_model
from agents_m.models import Profile
from datetime import date, datetime
import jdatetime


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
        jalali_date = jdatetime.date.fromgregorian(date=obj.created)
        return jalali_date.strftime("%Y/%m/%d")

    def get_persian_updated(self, obj):
        jalali_date = jdatetime.date.fromgregorian(date=obj.updated)
        return jalali_date.strftime("%Y/%m/%d")

    def get_file_date(self, obj):
        jalali_date = jdatetime.date.fromgregorian(date=obj.date)
        return jalali_date.strftime("%Y/%m/%d")

    def create(self, validated_data):
        username = validated_data.pop("username")
        profile = Profile.objects.get(user__username=username)
        validated_data["added_by"] = profile.user

        # changing the status based on date
        date_field = validated_data.get("date")
        today = date.today()
        passed_days = today - date_field
        if passed_days.days >= 90:
            validated_data["status"] = "UNACTIVE"
        else:
            validated_data["status"] = "ACTIVE"

        return super().create(validated_data)


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
        jalali_date = jdatetime.date.fromgregorian(date=obj.created)
        return jalali_date.strftime("%Y/%m/%d")

    def get_persian_updated(self, obj):
        jalali_date = jdatetime.date.fromgregorian(date=obj.updated)
        return jalali_date.strftime("%Y/%m/%d")

    def get_file_date(self, obj):
        jalali_date = jdatetime.date.fromgregorian(date=obj.date)
        return jalali_date.strftime("%Y/%m/%d")

    def create(self, validated_data):
        username = validated_data.pop("username")
        profile = Profile.objects.get(user__username=username)
        validated_data["added_by"] = profile.user

        # changing the status based on date
        date_field = validated_data.get("date")
        today = date.today()
        passed_days = today - date_field
        if passed_days.days >= 30:
            validated_data["status"] = "UNACTIVE"
        else:
            validated_data["status"] = "ACTIVE"

        return super().create(validated_data)
