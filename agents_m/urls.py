from django.urls import path, include
from . import auth

app_name = 'agents'
urlpatterns = [
    path('gen/', include('django.contrib.auth.urls')),
    path('login/', auth.GenericLoginView.as_view(), name='login'),
    path('logout/', auth.GenericLogoutView.as_view(), name='logout')
]
