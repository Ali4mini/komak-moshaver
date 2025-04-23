from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PersonViewSet

app_name = "utils"

router = DefaultRouter()
router.register(r'persons', PersonViewSet, basename='person')

urlpatterns = [
    path('', include(router.urls)),
]
