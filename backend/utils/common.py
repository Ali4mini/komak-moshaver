from functools import wraps
from rest_framework import serializers
from django.contrib.auth import get_user_model
from datetime import date, datetime


def set_added_by(serializer_class):
    """it get's the username and sets it to the correct User instance"""
    original_create = serializer_class.create

    @wraps(original_create)
    def new_create(self, validated_data):
        print("in added_by decorator")
        username = validated_data.pop("username", None)
        if username:
            User = get_user_model()
            try:
                user = User.objects.get(username=username)
                print("user is:\n", user)
                validated_data["added_by"] = user
            except User.DoesNotExist:
                print("failed")
                raise serializers.ValidationError({"added_by": "User does not exist."})

        return original_create(self, validated_data)

    serializer_class.create = new_create
    return serializer_class


def set_updated_logic(serializer_class):
    """the logic for determaining file and customer status based on the last update datetime"""

    original_create = serializer_class.create

    @wraps(original_create)
    def new_create(self, validated_data):
        print("in updated_logic decorator")
        today = datetime.now()
        updated_field = validated_data.get("updated", None)

        if updated_field is None:
            validated_data["updated"] = today

        # changing the status based on date
        date_field = validated_data.get("date", None)
        if date_field:
            today = date.today()
            passed_days = today - date_field
            if passed_days.days >= 30:
                validated_data["status"] = "UNACTIVE"
            else:
                validated_data["status"] = "ACTIVE"
        return original_create(self, validated_data)

    serializer_class.create = new_create
    return serializer_class
