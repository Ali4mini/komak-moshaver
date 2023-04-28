from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from . import views
app_name = 'file'

urlpatterns = [
    # Post views
    # path('', views.post_list, name='post_list'),
    path("new/", views.NewFile.as_view(), name="new_file"),
    # path('new-sell-file/', views.new_sell_file, name='new_sell_file'),
    # path('new-rent-file/', views.new_rent_file, name='new_rent_file'),
    path('sell/<int:pk>/', views.SellFileDetails.as_view(), name='sell_file_detail'),
    path('rent/<int:pk>/', views.RentFileDetails.as_view(), name='rent_file_detail'),
    # path('sell/<int:id>/delete', views.file_delete, name='sell_delete')
    path('sell/<int:pk>/delete/', views.SellFileDelete.as_view(), name='sell_delete'),
    path('rent/<int:pk>/delete/', views.RentFileDelete.as_view(), name='rent_delete'),
    path("sell/<int:pk>/edit/", views.SellUpdateView.as_view(), name="sell_update"),
    path("rent/<int:pk>/edit/", views.RentUpdateView.as_view(), name="sell_update"),
    path('sell/<int:pk>/send/', views.SellSendInfo.as_view(), name='sell_send_info'), 

]
