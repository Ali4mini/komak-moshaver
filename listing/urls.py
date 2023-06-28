from django.urls import path
from . import views
app_name = 'listing'

urlpatterns = [
    path('', views.Panel.as_view(), name='home'),
    path('listing/', views.Listing.as_view(), name='listing'),
    path('customers/', views.Customer.as_view(), name='customers'),
    path('pk/', views.FilePKFilter.as_view(), name='pk_filter')
]

