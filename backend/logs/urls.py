from django.urls import path
from . import views

app_name = "logs"

urlpatterns = [
    path("sell-call/", views.SellCallView.as_view(), name="sell-call-view"),
    path("rent-call/", views.RentCallView.as_view(), name="rent-call-view"),
    
]
