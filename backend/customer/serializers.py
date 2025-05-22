from rest_framework import serializers
from .models import BuyCustomer, RentCustomer
from utils.common import set_added_by, set_updated_logic
import jdatetime
from utils.models import Person


@set_added_by
@set_updated_logic
class BuyCustomerSerializer(serializers.ModelSerializer):
    customer_type = serializers.SerializerMethodField(read_only=True)
    username = serializers.CharField(max_length=100, write_only=True)
    customer_date = serializers.SerializerMethodField()
    persian_updated = serializers.SerializerMethodField()
    persian_created = serializers.SerializerMethodField()
    added_by = serializers.SerializerMethodField()
    customer_name = serializers.CharField(write_only=True, required=False)
    customer_phone = serializers.CharField(write_only=True, required=False)
    property_type_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()

    class Meta:
        model = BuyCustomer
        fields = "__all__"

    def create(self, validated_data):
        customer_name = validated_data.pop('customer_name', None)
        customer_phone = validated_data.pop('customer_phone', None)
        
        customer = None
        
        if customer_phone:
            try:
                customer = Person.objects.get(phone_number=customer_phone)
                if customer_name and customer.last_name != customer_name:
                    raise serializers.ValidationError({
                        'customer_phone': f'A person with this phone already exists with name "{customer.last_name}"'
                    })
            except Person.DoesNotExist:
                if customer_name:
                    print("person created")
                    customer = Person.objects.create(
                        last_name=customer_name,
                        phone_number=customer_phone
                    )
        
        if customer:
            validated_data['customer'] = customer
        
        return super().create(validated_data)


    def get_added_by(self, obj):
        user = obj.added_by
        return user.username

    def get_property_type_display(self, obj):
        return obj.get_property_type_display()

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_customer_type(self, obj):
        return "buy"

    def get_persian_created(self, obj):
        if obj.created:
            jalali_date = jdatetime.date.fromgregorian(date=obj.created)
            return jalali_date.strftime("%Y/%m/%d")

    def get_persian_updated(self, obj):
        if obj.updated:
            jalali_date = jdatetime.date.fromgregorian(date=obj.updated)
            return jalali_date.strftime("%Y/%m/%d")

    def get_customer_date(self, obj):
        if obj.date:
            jalali_date = jdatetime.date.fromgregorian(date=obj.date)
            return jalali_date.strftime("%Y/%m/%d")


@set_added_by
@set_updated_logic
class RentCustomerSerializer(serializers.ModelSerializer):
    customer_type = serializers.SerializerMethodField()
    username = serializers.CharField(max_length=100, write_only=True)
    customer_date = serializers.SerializerMethodField()
    persian_updated = serializers.SerializerMethodField()
    persian_created = serializers.SerializerMethodField()
    added_by = serializers.SerializerMethodField()
    customer_name = serializers.CharField(write_only=True, required=False)
    customer_phone = serializers.CharField(write_only=True, required=False)
    property_type_display = serializers.SerializerMethodField()
    status_display = serializers.SerializerMethodField()


    def create(self, validated_data):
        customer_name = validated_data.pop('customer_name', None)
        customer_phone = validated_data.pop('customer_phone', None)
        
        customer = None
        
        if customer_phone:
            try:
                customer = Person.objects.get(phone_number=customer_phone)
                if customer_name and customer.last_name != customer_name:
                    raise serializers.ValidationError({
                        'customer_phone': f'A person with this phone already exists with name "{customer.last_name}"'
                    })
            except Person.DoesNotExist:
                if customer_name:
                    print("person created")
                    customer = Person.objects.create(
                        last_name=customer_name,
                        phone_number=customer_phone
                    )
        
        if customer:
            validated_data['customer'] = customer
        
        return super().create(validated_data)

    class Meta:
        model = RentCustomer
        fields = "__all__"

    def get_added_by(self, obj):
        user = obj.added_by
        return user.username

    def get_property_type_display(self, obj):
        return obj.get_property_type_display()

    def get_status_display(self, obj):
        return obj.get_status_display()

    def get_customer_type(self, obj):
        return "rent"

    def get_persian_created(self, obj):
        if obj.created:
            jalali_date = jdatetime.date.fromgregorian(date=obj.created)
            return jalali_date.strftime("%Y/%m/%d")

    def get_persian_updated(self, obj):
        if obj.updated:
            jalali_date = jdatetime.date.fromgregorian(date=obj.updated)
            return jalali_date.strftime("%Y/%m/%d")

    def get_customer_date(self, obj):
        if obj.date:
            jalali_date = jdatetime.date.fromgregorian(date=obj.date)
            return jalali_date.strftime("%Y/%m/%d")
