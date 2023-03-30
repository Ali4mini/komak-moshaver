from django.urls import path
from . import views
app_name = 'listing'

urlpatterns = [
    path('', views.Panel.as_view(), name='list')
]

