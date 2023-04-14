from django.urls import path
from . import views

app_name = 'customer'

urlpatterns = [
    path('new/buy', views.buy_customer, name='new_buy_customer'),
    path('new/rent', views.rent_customer, name='new_rent_customer'),
    path('new/', views.Customer.as_view(), name='new_customer')
]
