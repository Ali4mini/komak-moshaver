from django.urls import path, include
from . import views
from django.conf import settings
from django.conf.urls.static import static
app_name = 'file'

urlpatterns = [
    # Post views
    # path('', views.post_list, name='post_list'),
    path('new-sell-file/', views.new_sell_file, name='new_sell_file'),
    path('new-rent-file/', views.new_rent_file, name='new_rent_file'),
    path('sell/<int:id>/', views.FileDetails.as_view(), name='sell_file_detail'),
    path('rent/<int:id>/', views.FileDetails.as_view(), name='rent_file_detail'),
    # path('sell/<int:id>/delete', views.file_delete, name='sell_delete')
    path('sell/<int:pk>/delete/', views.FileDelete.as_view(), name='sell_delete'),
    path("sell/<int:pk>/edit/", views.SellUpdateView.as_view(), name="sell_update"),


]
