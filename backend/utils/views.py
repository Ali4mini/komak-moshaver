from rest_framework import viewsets, filters
from .models import Person
from .serializers import PersonSerializer
from django_filters.rest_framework import DjangoFilterBackend # Ensure this is imported

class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter, DjangoFilterBackend]
    
    filterset_fields = {
        'gender': ['exact'], 
        'phone_number': ['exact', 'startswith', 'contains'], 
        'id': ['exact'],
        'last_name': ['exact', 'startswith', 'contains'],
    }
    search_fields = ['first_name', 'last_name', 'phone_number']
    ordering_fields = ['last_name', 'first_name', 'created_at']
    ordering = ['last_name']
