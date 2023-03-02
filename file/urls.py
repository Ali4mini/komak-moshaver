from django.urls import path
from . import views
from . import auth
app_name = 'file'

urlpatterns = [
    # Post views
    # path('', views.post_list, name='post_list'),
    path('', views.panel, name='post_list'),
    path('new-sell-file', views.new_sell_file, name='new_sell_file'),
    path('new-rent-file', views.new_rent_file, name='new_rent_file'),
    path('login_agent/', auth.agent_login, name='login'),

]
