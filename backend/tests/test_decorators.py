import pytest
from datetime import datetime, timedelta
from utils.common import set_updated_logic, set_added_by
from django.contrib.auth import get_user_model
from rest_framework import serializers


# Create a mock serializer class with a create method to be decorated
class MockSerializer:
    def __init__(self):
        self.validated_data = {}

    def create(self, validated_data):
        return validated_data  # Simply return validated data for testing


# Apply the decorator to the mock serializer
@set_added_by
@set_updated_logic
class DecoratedMockSerializer(MockSerializer):
    pass


@pytest.mark.django_db
def test_decorator_sets_updated_field():
    """Test that 'updated' is set to now if not provided."""
    today = datetime.now().date()
    serializer = DecoratedMockSerializer()

    # Simulate input data without 'updated'
    input_data = {"date": today}
    serializer.validated_data = input_data

    result = serializer.create(serializer.validated_data)

    assert "updated" in result
    assert result["updated"] is not None  # Ensure updated field is set
    assert result["status"] == "ACTIVE"  # Default status should be ACTIVE


@pytest.mark.django_db
def test_decorator_sets_status_unactive_if_date_older_than_30_days():
    """Test that status is set to 'UNACTIVE' if date is older than 30 days."""
    old_date = datetime.now().date() - timedelta(days=31)
    serializer = DecoratedMockSerializer()

    # Simulate input data with a date older than 30 days
    input_data = {"date": old_date}
    serializer.validated_data = input_data

    result = serializer.create(serializer.validated_data)

    assert "updated" in result
    assert result["status"] == "UNACTIVE"


@pytest.mark.django_db
def test_decorator_sets_status_active_if_date_within_30_days():
    """Test that status is set to 'ACTIVE' if date is within 30 days."""
    recent_date = datetime.now().date() - timedelta(days=29)
    serializer = DecoratedMockSerializer()

    # Simulate input data with a recent date
    input_data = {"date": recent_date}
    serializer.validated_data = input_data

    result = serializer.create(serializer.validated_data)

    assert "updated" in result
    assert result["status"] == "ACTIVE"


@pytest.mark.django_db
def test_decorator_does_not_overwrite_provided_updated_field():
    """Test that 'updated' field is not overwritten if provided."""
    provided_updated = datetime.now().date() - timedelta(days=1)

    serializer = DecoratedMockSerializer()

    # Simulate input data with a provided updated date
    input_data = {"date": datetime.now().date(), "updated": provided_updated}
    serializer.validated_data = input_data

    result = serializer.create(serializer.validated_data)

    assert result["updated"] == provided_updated  # Should retain provided updated date


@pytest.mark.django_db
def test_set_added_by_with_existing_user(sample_user):
    """Test that 'added_by' is set correctly when username exists."""
    User = get_user_model()
    user = User.objects.create(username="testuser")  # Create a test user

    serializer = DecoratedMockSerializer()

    # Simulate input data with an existing username
    input_data = {"username": "testuser", "other_field": "value"}
    serializer.validated_data = input_data

    result = serializer.create(serializer.validated_data)

    assert result["added_by"] == user


@pytest.mark.django_db
def test_set_added_by_with_non_existing_user():
    """Test that a ValidationError is raised when username does not exist."""
    serializer = DecoratedMockSerializer()

    # Simulate input data with a non-existing username
    input_data = {"username": "nonexistentuser", "other_field": "value"}
    serializer.validated_data = input_data

    with pytest.raises(serializers.ValidationError) as excinfo:
        serializer.create(serializer.validated_data)

    assert "User does not exist." in str(excinfo.value)  # Check for error message


@pytest.mark.django_db
def test_set_added_by_without_username():
    """Test that 'added_by' is not set when username is not provided."""
    serializer = DecoratedMockSerializer()

    # Simulate input data without a username
    input_data = {"other_field": "value"}
    serializer.validated_data = input_data

    result = serializer.create(serializer.validated_data)

    assert "added_by" not in result  # added_by should not be present in the result
