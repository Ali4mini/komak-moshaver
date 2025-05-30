# your_app/filters.py
import django_filters
from django.contrib.auth import get_user_model
from logs.models import Call

User = get_user_model()

class CallFilter(django_filters.FilterSet):
    # Agent filter - by username or ID
    # You can use ModelChoiceFilter if you want to pass agent's username or PK
    agent = django_filters.ModelChoiceFilter(
        queryset=User.objects.all(),
        field_name='agent', # or 'agent__username' if you want to filter by username
        to_field_name='username', # which field on User model to match against (e.g. 'username' or 'id')
        label='Agent Username'
    )
    # Alternative for agent ID if you prefer passing numeric IDs
    # agent_id = django_filters.NumberFilter(field_name='agent_id')

    # Date filtering (for start_time)
    # Allows filtering by a specific date or a range
    start_date = django_filters.DateFilter(field_name='start_time', lookup_expr='date__gte', label='Start Date (YYYY-MM-DD)')
    end_date = django_filters.DateFilter(field_name='start_time', lookup_expr='date__lte', label='End Date (YYYY-MM-DD)')
    # If you want to filter by a specific datetime:
    # start_time_exact = django_filters.DateTimeFilter(field_name='start_time', lookup_expr='exact')

    # Location filter
    # Filtering JSONField can be tricky. Here are a few options:
    # Option 1: Simple text search within the JSON (less efficient, generic)
    # location_contains = django_filters.CharFilter(field_name='location', lookup_expr='icontains', label='Location (any part)')

    # Option 2: Filter by a specific key in the JSON (if structure is consistent)
    # Assuming location is like {"city": "New York", "country": "USA"}
    location_city = django_filters.CharFilter(field_name='location__city', lookup_expr='icontains', label='Location City')
    location_country = django_filters.CharFilter(field_name='location__country', lookup_expr='icontains', label='Location Country')
    # Add more specific location filters as needed based on your JSON structure

    # Call Type filter
    call_type = django_filters.ChoiceFilter(choices=Call.CallType.choices)

    # Call Status filter
    call_status = django_filters.ChoiceFilter(choices=Call.CallStatus.choices)

    # Person filter (by person ID)
    person_id = django_filters.NumberFilter(field_name='person_id')


    class Meta:
        model = Call
        # Define fields that can be filtered directly by their exact value
        # (if not already defined with custom lookups above)
        fields = {
            'phone_number': ['exact', 'icontains'],
            'is_transcript_correct': ['exact'],
        }
        # Note: 'agent', 'call_type', 'call_status' are handled by explicit definitions above.
        # 'start_date', 'end_date', 'location_city', etc. are also custom.
