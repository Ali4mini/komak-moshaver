from .serializers import ProfileSerializer, UserSerializer
from .models import Profile
from rest_framework import generics
from django.contrib.auth.models import User
from rest_framework import permissions
from rest_framework.generics import CreateAPIView
from django.contrib.auth import get_user_model  # If used custom user model


class CreateUserView(CreateAPIView):
    model = get_user_model()
    authentication_classes = []
    permission_classes = [permissions.AllowAny]  # Or anon users can't register
    serializer_class = UserSerializer


class LoginUser(generics.RetrieveAPIView):
    model = get_user_model()
    authentication_classes = []
    permission_classes = [permissions.AllowAny]
    serializer_class = UserSerializer


class ProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_object(self):
        username = self.kwargs["username"]
        user = User.objects.get(username=username)
        return Profile.objects.get(user=user)


class NewProfile(generics.CreateAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer
