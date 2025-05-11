from rest_framework import serializers
from .models import (
    Sell,
    Rent,
    SellImage,
    RentImage,
    SellStaticLocation,
    RentStaticLocation,
)
from utils.common import set_added_by, set_updated_logic
import jdatetime

from utils.models import Person

class SellStaticLocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = SellStaticLocation
        fields = ["location", "image"]
        # read_only_fields = ["image"]


class RentStaticLocationSerializer(serializers.ModelSerializer):

    class Meta:
        model = RentStaticLocation
        fields = ["location", "image"]
        # read_only_fields = ["image"]


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
    owner_name = serializers.CharField(write_only=True, required=False)
    owner_phone = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Sell
        fields = "__all__"

    def create(self, validated_data):
        owner_name = validated_data.pop('owner_name', None)
        owner_phone = validated_data.pop('owner_phone', None)
        
        owner = None
        
        if owner_phone:
            try:
                owner = Person.objects.get(phone_number=owner_phone)
                if owner_name and owner.last_name != owner_name:
                    raise serializers.ValidationError({
                        'owner_phone': f'A person with this phone already exists with name "{owner.last_name}"'
                    })
            except Person.DoesNotExist:
                if owner_name:
                    print("person created")
                    owner = Person.objects.create(
                        last_name=owner_name,
                        phone_number=owner_phone
                    )
        
        if owner:
            validated_data['owner'] = owner
        
        return super().create(validated_data)

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
    owner_name = serializers.CharField(write_only=True, required=False)
    owner_phone = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = Rent
        fields = "__all__"

    def create(self, validated_data):
        owner_name = validated_data.pop('owner_name', None)
        owner_phone = validated_data.pop('owner_phone', None)
        
        owner = None
        
        if owner_phone:
            try:
                owner = Person.objects.get(phone_number=owner_phone)
                if owner_name and owner.last_name != owner_name:
                    raise serializers.ValidationError({
                        'owner_phone': f'A person with this phone already exists with name "{owner.name}"'
                    })
            except Person.DoesNotExist:
                if owner_name:
                    print("person created")
                    owner = Person.objects.create(
                        last_name=owner_name,
                        phone_number=owner_phone
                    )
        
        if owner:
            validated_data['owner'] = owner
        
        return super().create(validated_data)

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
