from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile
from utils.common import set_added_by


UserModel = get_user_model()


@set_added_by
class ProfileSerializer(serializers.ModelSerializer):
    user = serializers.CharField()

    class Meta:
        model = Profile
        fields = [
            "user",
            "first_name",
            "last_name",
            "phone_number",
            "agency",
            "role",
            "field",
        ]


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = UserModel

        fields = (
            "id",
            "username",
            "password",
        )

    def create(self, validated_data):
        user = UserModel.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )

        return user
