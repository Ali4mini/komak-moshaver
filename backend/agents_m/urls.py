from django.urls import path
from . import views

app_name = "agents"
urlpatterns = [
    path("profile/<str:username>/", views.ProfileDetail.as_view(), name="profile"),
    path("new/profile/", views.NewProfile.as_view(), name="new_profile"),
    path("signup/", views.CreateUserView.as_view(), name="signup"),
]
