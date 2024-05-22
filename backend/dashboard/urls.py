from django.urls import path, include
from . import views

app_name = "dashboard"

urlpatterns = [
    path("customer-per-day/", views.CustomersCounts.as_view(), name="customer-per-day"),
    path("file-per-day/", views.FilesCounts.as_view(), name="file-per-day"),
    path("property-type-diversity/", views.FileTypeDiversity.as_view(), name="file-type-diversity"),
    path("file-price-diversity/", views.FilePriceDiversity.as_view(), name="file-price-diversity"),

]
