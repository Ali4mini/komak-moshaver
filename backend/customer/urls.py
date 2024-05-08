from django.urls import path
from . import views

app_name = 'customer'

urlpatterns = [
    path('buy/new/', views.NewBuyCustomer.as_view(), name='new_buy_customer'),
    path('rent/new/', views.NewRentCustomer.as_view(), name='new_rent_customer'),
    path('buy/<int:pk>/', views.BuyCustomerDetails.as_view(), name='buy_customer_detail'),
    path('rent/<int:pk>/', views.RentCustomerDetails.as_view(), name='rent_customer_detail'),
    path(
        "buy/<int:pk>/related_files/",
        views.BuyCustomerRelatedFiles.as_view(),
        name="sell_related_files",
    ),
    path(
        "rent/<int:pk>/related_files/",
        views.RentCustomerRelatedFiles.as_view(),
        name="rent_related_files",
    ),
]
