from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views

app_name = "file"

urlpatterns = [
    path("sell/new/", views.NewSellFile.as_view(), name="new_sell_file"),
    path("rent/new/", views.NewRentFile.as_view(), name="new_rent_file"),
    path("sell/<int:pk>/", views.SellFileDetails.as_view(), name="sell_file_detail"),
    path("rent/<int:pk>/", views.RentFileDetails.as_view(), name="rent_file_detail"),
    path("sell/<int:pk>/send/", views.SellSendInfo.as_view(), name="sell_send_info"),
    path("rent/<int:pk>/send/", views.SellSendInfo.as_view(), name="rent_send_info"),
    path(
        "sell/<int:file_id>/images/",
        views.SellFileImages.as_view(),
        name="sell_file_images",
    ),
    path(
        "sell/<int:pk>/related_customers/",
        views.SellRelatedCustomers.as_view(),
        name="sell_related_customer",
    ),
    path(
        "rent/<int:pk>/related_customers/",
        views.RentRelatedCustomers.as_view(),
        name="rent_related_customer",
    ),
]
