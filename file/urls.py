from django.urls import path
from . import views


app_name = 'file'

urlpatterns = [
    # Post views
    # path('', views.post_list, name='post_list'),
    path('', views.panel, name='post_list'),
    path('new-sell-file/', views.new_sell_file, name='new_sell_file'),
    path('new-rent-file/', views.new_rent_file, name='new_rent_file'),
    path('sell/<int:id>/', views.file_detail, name='sell_file_detail'),
    path('rent/<int:id>/', views.file_detail, name='rent_file_detatil'),

]
