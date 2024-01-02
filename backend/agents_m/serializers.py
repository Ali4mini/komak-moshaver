from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Profile


UserModel = get_user_model()


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

    def create(self, validated_data):
        user_data = validated_data.pop("user")
        user = UserModel.objects.get(username=user_data)
        validated_data["user"] = user
        return super().create(validated_data)


class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    def create(self, validated_data):
        user = UserModel.objects.create_user(
            username=validated_data["username"],
            password=validated_data["password"],
        )

        return user

    class Meta:
        model = UserModel
        # Tuple of serialized model fields (see link [2])
        fields = (
            "id",
            "username",
            "password",
        )
