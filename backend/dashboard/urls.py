from django.urls import path, include
from . import views
from rest_framework import routers

app_name = "dashboard"

router = routers.DefaultRouter()
router.register(r'', views.TaskViewSet, basename='Tasks')

urlpatterns = [
    path("customer-per-day/", views.CustomersCounts.as_view(), name="customer-per-day"),
    path("file-per-day/", views.FilesCounts.as_view(), name="file-per-day"),
    path("property-type-diversity/", views.FileTypeDiversity.as_view(), name="file-type-diversity"),
    path("file-price-diversity/", views.FilePriceDiversity.as_view(), name="file-price-diversity"),
    path("customer-budget-diversity/", views.CustomerBudgetDiversity.as_view(), name="customer-budget-diversity"),
    path('tasks/', include(router.urls)),

]
