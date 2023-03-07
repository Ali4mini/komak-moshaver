from django.urls import path
from . import auth

app_name = 'agent'

urlpatterns = [

    path('login/', auth.agent_login, name='login'),

]