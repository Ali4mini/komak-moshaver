from django.urls import path
from . import auth
from . import views
app_name = 'agent'

urlpatterns = [

    path('login/', auth.agent_login, name='login'),
    path('profile/', views.profile, name='profile'),

]