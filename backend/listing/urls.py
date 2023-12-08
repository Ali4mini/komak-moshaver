from django.urls import path
from . import views
app_name = 'listing'

urlpatterns = [
    path('', views.FileFilter.as_view(), name='files'),
    path('customers/', views.CustomerFilter.as_view(), name='customers'),
]

