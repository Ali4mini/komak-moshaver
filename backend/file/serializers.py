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
    owner_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    owner_phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    # Updated tenant fields to include allow_null=True
    tenant_name = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    tenant_phone = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    property_type_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Sell
        fields = "__all__"
        # read_only_fields = ('added_by',) # if decorator sets 'added_by'

    def _get_or_create_person(self, phone_number, name):
        """Helper to get or create a Person."""
        person = None
        if phone_number: # Only proceed if phone number is provided
            try:
                person = Person.objects.get(phone_number=phone_number)
                # Optionally update the name if provided and different
                if name and person.last_name != name: # Or use a more comprehensive name field
                    print(f'Person with phone {phone_number} exists with name "{person.last_name}". Updating name to "{name}".')
                    person.last_name = name # Or update other name fields as appropriate
                    person.save(update_fields=['last_name']) # Or relevant fields
            except Person.DoesNotExist:
                if name: # Only create if name is also provided
                    print(f"Creating new person: Name - {name}, Phone - {phone_number}")
                    person = Person.objects.create(
                        last_name=name, # Or first_name, full_name depending on Person model
                        phone_number=phone_number
                    )
                else:
                    # Cannot create person without a name if phone is new
                    print(f"Cannot create person for phone {phone_number} without a name.")
            except Person.MultipleObjectsReturned:
                print(f"Warning: Multiple people found with phone number {phone_number}. Using the first one.")
                person = Person.objects.filter(phone_number=phone_number).first()
        elif name: # If only name is provided, but not phone (less common for get_or_create)
             print(f"Warning: Name '{name}' provided without a phone number. Cannot reliably get/create person.")
        return person

    def create(self, validated_data):
        validated_data.pop('username', None)

        owner_name = validated_data.pop('owner_name', None)
        owner_phone = validated_data.pop('owner_phone', None)
        tenant_name = validated_data.pop('tenant_name', None)
        tenant_phone = validated_data.pop('tenant_phone', None)

        owner = self._get_or_create_person(owner_phone, owner_name)
        if owner:
            validated_data['owner'] = owner
        
        tenant = self._get_or_create_person(tenant_phone, tenant_name)
        if tenant:
            validated_data['tenant'] = tenant
        
        return super().create(validated_data)

    def get_file_type(self, obj):
        return "sell"

    def get_property_type_display(self, obj):
        return obj.get_property_type_display()

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_added_by(self, obj):
        if obj.added_by:
            return obj.added_by.username
        return None

    def get_persian_created(self, obj):
        if obj.created:
            try:
                jalali_date = jdatetime.date.fromgregorian(date=obj.created)
                return jalali_date.strftime("%Y/%m/%d")
            except ValueError:
                return obj.created.strftime("%Y-%m-%d")
        return None

    def get_persian_updated(self, obj):
        if obj.updated:
            try:
                jalali_date = jdatetime.date.fromgregorian(date=obj.updated)
                return jalali_date.strftime("%Y/%m/%d")
            except ValueError:
                return obj.updated.strftime("%Y-%m-%d")
        return None

    def get_file_date(self, obj):
        if obj.date:
            try:
                jalali_date = jdatetime.date.fromgregorian(date=obj.date)
                return jalali_date.strftime("%Y/%m/%d")
            except ValueError:
                return obj.date.strftime("%Y-%m-%d")
        return None


@set_added_by
@set_updated_logic
class RentFileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(max_length=100, write_only=True)
    file_type = serializers.SerializerMethodField()
    file_date = serializers.SerializerMethodField()
    persian_created = serializers.SerializerMethodField()
    persian_updated = serializers.SerializerMethodField()
    added_by = serializers.SerializerMethodField()
    owner_name = serializers.CharField(write_only=True, required=False, allow_blank=True)
    owner_phone = serializers.CharField(write_only=True, required=False, allow_blank=True)
    # Updated tenant fields to include allow_null=True
    tenant_name = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    tenant_phone = serializers.CharField(write_only=True, required=False, allow_blank=True, allow_null=True)
    property_type_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = Rent
        fields = "__all__"
        # read_only_fields = ('added_by',) # if decorator sets 'added_by'

    def _get_or_create_person(self, phone_number, name):
        """Helper to get or create a Person."""
        person = None
        if phone_number: # Only proceed if phone number is provided
            try:
                person = Person.objects.get(phone_number=phone_number)
                if name and person.last_name != name:
                    print(f'Person with phone {phone_number} exists with name "{person.last_name}". Updating name to "{name}".')
                    person.last_name = name
                    person.save(update_fields=['last_name'])
            except Person.DoesNotExist:
                if name:
                    print(f"Creating new person: Name - {name}, Phone - {phone_number}")
                    person = Person.objects.create(
                        last_name=name,
                        phone_number=phone_number
                    )
                else:
                    print(f"Cannot create person for phone {phone_number} without a name.")
            except Person.MultipleObjectsReturned:
                print(f"Warning: Multiple people found with phone number {phone_number}. Using the first one.")
                person = Person.objects.filter(phone_number=phone_number).first()
        elif name:
             print(f"Warning: Name '{name}' provided without a phone number. Cannot reliably get/create person.")
        return person

    def create(self, validated_data):
        validated_data.pop('username', None)

        owner_name = validated_data.pop('owner_name', None)
        owner_phone = validated_data.pop('owner_phone', None)
        tenant_name = validated_data.pop('tenant_name', None)
        tenant_phone = validated_data.pop('tenant_phone', None)
        
        owner = self._get_or_create_person(owner_phone, owner_name)
        if owner:
            validated_data['owner'] = owner
        
        tenant = self._get_or_create_person(tenant_phone, tenant_name)
        if tenant:
            validated_data['tenant'] = tenant
        
        return super().create(validated_data)

    def get_file_type(self, obj):
        return "rent"

    def get_property_type_display(self, obj):
        return obj.get_property_type_display()

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_added_by(self, obj):
        if obj.added_by:
            return obj.added_by.username
        return None

    def get_persian_created(self, obj):
        if obj.created:
            try:
                jalali_date = jdatetime.date.fromgregorian(date=obj.created)
                return jalali_date.strftime("%Y/%m/%d")
            except ValueError:
                return obj.created.strftime("%Y-%m-%d")
        return None

    def get_persian_updated(self, obj):
        if obj.updated:
            try:
                jalali_date = jdatetime.date.fromgregorian(date=obj.updated)
                return jalali_date.strftime("%Y/%m/%d")
            except ValueError:
                return obj.updated.strftime("%Y-%m-%d")
        return None

    def get_file_date(self, obj):
        if obj.date:
            try:
                jalali_date = jdatetime.date.fromgregorian(date=obj.date)
                return jalali_date.strftime("%Y/%m/%d")
            except ValueError:
                return obj.date.strftime("%Y-%m-%d")
        return None
