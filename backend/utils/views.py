from rest_framework import viewsets, filters
from .models import Person
from .serializers import PersonSerializer
from django_filters.rest_framework import DjangoFilterBackend # Ensure this is imported
from rest_framework.decorators import action
from rest_framework.response import Response
from file.serializers import SellFileSerializer, RentFileSerializer

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
    
    @action(detail=True, methods=['get'])
    def files(self, request, pk=None):
        """
        Returns the IDs of all Sell and Rent instances associated with a specific Person.
        """
        person = self.get_object()

        # Get related Sell instances and extract their IDs
        sell_ids = person.owned_properties.values_list('id', flat=True) # returns a list of IDs

        # Get related Rent instances and extract their IDs
        rent_ids = person.rents_as_owner.values_list('id', flat=True) # returns a list of IDs

        return Response({
            'sell_ids': list(sell_ids), # Convert QuerySet to list for JSON serialization
            'rent_ids': list(rent_ids),
        })
