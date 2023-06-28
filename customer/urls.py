from django.urls import path
from . import views

app_name = 'customer'

urlpatterns = [
    path('new/', views.NewCustomer.as_view(), name='new_customer'),
    path('buy/<int:pk>/', views.BuyCustomerDetails.as_view(), name='buy_customer_detail'),
    path('rent/<int:pk>/', views.RentCustomerDetails.as_view(), name='rent_customer_detail'),
    path('rent/<int:pk>/delete/', views.RentCustomerDelete.as_view(), name='rent_customer_delete'),
    path('buy/<int:pk>/delete/', views.BuyCustomerDelete.as_view(), name='buy_customer_delete'),
    path('buy/<int:pk>/edit/', views.BuyUpdateView.as_view(), name='buy_customer_delete'),
    path('rent/<int:pk>/edit/', views.RentUpdateView.as_view(), name='buy_customer_delete'),
    

]
