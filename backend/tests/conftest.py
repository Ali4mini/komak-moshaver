# conftest.py
import pytest
from rest_framework.test import APIClient
from django.contrib.auth.models import User
from file.models import Sell, Rent
from customer.models import BuyCustomer, RentCustomer


@pytest.fixture
def api_client():
    """Fixture for creating an API client."""
    return APIClient()


@pytest.fixture
def sample_user(db):
    """Fixture for creating a sample user."""
    user = User.objects.create_user(username="test", password="test")
    return user


@pytest.fixture
def sample_rent_customer(db, sample_user):
    return RentCustomer.objects.create(
        customer_name="Jane Doe",
        customer_phone="09123456789",
        property_type=RentCustomer.Types.APARTEMANT,
        up_budget=300000,
        rent_budget=1500.0,
        m2=100,
        year=2020,
        bedroom=3,
        vahedha=1,
        added_by=sample_user,  # Reference the created user
        parking=True,
        elevator=False,
        storage=True,
        id=10,
    )


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
        added_by=sample_user,
        bedroom=4,
    )

    # Link one of the rents to the customer
    rent1.notified_customers.add(sample_rent_customer)

    return [rent1, rent2]


@pytest.fixture
def sample_sell_file(db, sample_user):

    # Create a sample Sell instance
    sell_instance = Sell.objects.create(
        owner_name="John Doe",
        owner_phone="09123456789",
        address="123 Sample St, Sample City",
        m2=100,
        price=250000,
        year=2020,
        floor=2,
        elevator=True,
        storage=True,
        parking=True,
        property_type=Sell.Types.APARTEMANT,
        added_by=sample_user,
        bedroom=3,
        parking_motor=False,
        takhlie="Sample takhlie",
        vahedha=1,
        komod_divari=False,
        bazdid="Sample bazdid",
        tabaghat=1,
        status=Sell.Status.ACTIVE,
        description="Sample description",
    )

    return sell_instance


@pytest.fixture
def sample_buy_customer(db, sample_user):
    customer = BuyCustomer.objects.create(
        customer_name="John Doe",
        customer_phone="09123456789",
        property_type=BuyCustomer.Types.APARTEMANT,
        budget=300000,
        m2=100,
        year=2020,
        bedroom=3,
        vahedha=1,
        added_by=sample_user,
        parking=True,
        elevator=False,
        storage=True,
        id=10,
    )

    print(customer.pk)
    return customer


@pytest.fixture
def sample_sells(db, sample_buy_customer, sample_user):
    # Create related Sell instances
    sell1 = Sell.objects.create(
        owner_name="Owner 1",
        owner_phone="09123456789",
        address="Address 1",
        m2=90,
        price=250000,
        year=2020,
        floor=2,
        elevator=True,
        storage=True,
        parking=True,
        property_type=Sell.Types.APARTEMANT,
        added_by=sample_user,
        bedroom=3,
    )

    sell2 = Sell.objects.create(
        owner_name="Owner 2",
        owner_phone="09123456780",
        address="Address 2",
        m2=110,
        price=350000,
        year=2019,
        floor=1,
        elevator=False,
        storage=False,
        parking=False,
        property_type=Sell.Types.APARTEMANT,
        added_by=sample_user,
        bedroom=4,
    )

    # Link one of the sells to the customer
    sell1.notified_customers.add(sample_buy_customer)

    return [sell1, sell2]


@pytest.fixture
def sample_rent_file(db, sample_user):
    rent1 = Rent.objects.create(
        owner_name="Owner 1",
        owner_phone="09123456789",
        address="Address 1",
        m2=90,
        price_up=250,
        price_rent=12,
        year=2020,
        floor=2,
        elevator=True,
        storage=True,
        parking=True,
        property_type=Rent.Types.APARTEMANT,
        added_by=sample_user,
        bedroom=3,
        date="2024-11-29",
    )

    return rent1
