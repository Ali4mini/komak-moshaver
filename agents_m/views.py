from .serializers import ProfileSerializer
from .models import Profile
from rest_framework import generics
from django.contrib.auth.models import User

class ProfileDetail(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileSerializer

    def get_object(self):
        username = self.kwargs['username']
        user = User.objects.get(username=username)
        return Profile.objects.get(user=user)