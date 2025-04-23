from rest_framework import viewsets, filters
from .models import Person
from .serializers import PersonSerializer

class PersonViewSet(viewsets.ModelViewSet):
    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    
    filterset_fields = ['gender']
    search_fields = ['first_name', 'last_name', 'phone_number']
    ordering_fields = ['last_name', 'first_name', 'created_at']
    ordering = ['last_name']
