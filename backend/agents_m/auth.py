from django.contrib.auth.views import LoginView, LogoutView
from rest_framework.generics import CreateAPIView
from django.contrib.auth.models import User
from .serializers import UserSerializer


class GenericLoginView(LoginView):
    next_page = "/"


class GenericLogoutView(LogoutView):
    next_page = "/"
