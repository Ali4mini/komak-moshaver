import pytest
from datetime import date, timedelta
from file.models import Rent


@pytest.fixture
def sample_rents(db, sample_rent_customer, sample_user):

    # Create related Rent instances
    rent1 = Rent.objects.create(
        owner_name="Owner 1",
        owner_phone="09123456789",
        address="Address 1",
        m2=90,
        price_up=250000,
        price_rent=1200.0,
        year=2020,
        floor=2,
        elevator=True,
        storage=True,
        parking=True,
        property_type=Rent.Types.APARTEMANT,
        added_by=sample_user,
        date=date.today() - timedelta(days=300),
        bedroom=3,
    )

    rent2 = Rent.objects.create(
        owner_name="Owner 2",
        owner_phone="09123456780",
        address="Address 2",
        m2=110,
        price_up=350000,
        price_rent=1600.0,
        year=2019,
        floor=1,
        elevator=False,
        storage=False,
        parking=False,
        property_type=Rent.Types.APARTEMANT,
        date=date.today() - timedelta(days=340),  # 25 days before
        added_by=sample_user,
        bedroom=4,
    )
    rent3 = Rent.objects.create(
        owner_name="Owner 2",
        owner_phone="09123456780",
        address="Address 2",
        m2=110,
        price_up=350000,
        price_rent=1600.0,
        year=2019,
        floor=1,
        elevator=False,
        storage=False,
        parking=False,
        property_type=Rent.Types.APARTEMANT,
        date=date.today() - timedelta(days=370),  # after the file date
        added_by=sample_user,
        bedroom=4,
    )

    rent4 = Rent.objects.create(
        owner_name="Owner 1",
        owner_phone="09123456789",
        address="Address 1",
        m2=90,
        price_up=250000,
        price_rent=1200.0,
        year=2020,
        floor=2,
        elevator=True,
        storage=True,
        parking=True,
        property_type=Rent.Types.APARTEMANT,
        added_by=sample_user,
        date=date.today(),
        bedroom=3,
    )

    # WARN: rent2 should be the result
    return [rent1, rent2, rent3, rent4]


@pytest.mark.django_db
def test_rent_file_restore_with_filter(api_client, sample_rents):
    """Test that RentFileRestore filters records based on date."""

    url = "http://localhost:8000/api/listing/restore/"
    response = api_client.get(url)

    assert response.status_code == 200
    assert len(response.data["results"]) == 1  # Only one record should be returned
