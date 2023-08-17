from django.urls import path, include
from . import auth
from . import views

app_name = 'agents'
urlpatterns = [
    path('gen/', include('django.contrib.auth.urls')),
    path('login/', auth.GenericLoginView.as_view(), name='login'),
    path('logout/', auth.GenericLogoutView.as_view(), name='logout'),
    path('profile/<str:username>/', views.ProfileDetail.as_view(), name='profile'),
]
