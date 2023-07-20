from django.urls import path
from . import views

app_name = 'customer'

urlpatterns = [
    path('buy/new/', views.NewBuyCustomer.as_view(), name='new_buy_customer'),
    path('rent/new/', views.NewRentCustomer.as_view(), name='new_buy_customer'),
    path('buy/<int:pk>/', views.BuyCustomerDetails.as_view(), name='buy_customer_detail'),
    path('rent/<int:pk>/', views.RentCustomerDetails.as_view(), name='rent_customer_detail'),
]
