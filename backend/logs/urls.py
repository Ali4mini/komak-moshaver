from django.urls import path
from . import views

app_name = "logs"

urlpatterns = [
    path("sell-call/", views.SellCallView.as_view(), name="sell-call-view"),
    path("rent-call/", views.RentCallView.as_view(), name="rent-call-view"),
    path("sell-tour/", views.SellTourView.as_view(), name="sell-tour-view"),
    path("rent-tour/", views.RentTourView.as_view(), name="rent-tour-view"),
    path("smsLogs/", views.SMSLogView.as_view(), name="smsLogView"),
    path("smsLogs/<int:pk>/resend/", views.SMSLogResend.as_view(), name="SMSLogResend"),
]
