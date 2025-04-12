import pytest
from typing import List
from customer.models import BuyCustomer, RentCustomer
from file.models import Rent, Sell


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


@pytest.fixture
def sample_rent_customers(db, sample_rent_customer, sample_user):
    # customers have more or same budget as the file price
    rent_customer1 = RentCustomer.objects.create(
        customer_name="Jane Doe",
        customer_phone="09123456789",
        property_type=RentCustomer.Types.APARTEMANT,
        up_budget=300,
        rent_budget=15,
        m2=100,
        year=2020,
        bedroom=3,
        vahedha=1,
        added_by=sample_user,  # Reference the created user
        parking=True,
        elevator=False,
        storage=True,
        date="2024-11-29",
    )
    rent_customer2 = RentCustomer.objects.create(
        customer_name="Jane Doe",
        customer_phone="09123456789",
        property_type=RentCustomer.Types.APARTEMANT,
        up_budget=100,
        rent_budget=10,
        m2=100,
        year=2020,
        bedroom=3,
        vahedha=1,
        added_by=sample_user,  # Reference the created user
        parking=True,
        elevator=False,
        storage=True,
        date="2024-11-29",
    )
    rent_customer3 = RentCustomer.objects.create(
        customer_name="Jane Doe",
        customer_phone="09123456789",
        property_type=RentCustomer.Types.APARTEMANT,
        up_budget=250,
        rent_budget=12,
        m2=100,
        year=2020,
        bedroom=3,
        vahedha=1,
        added_by=sample_user,  # Reference the created user
        parking=True,
        elevator=False,
        storage=True,
        date="2024-11-29",
    )

    return [rent_customer1, rent_customer2, rent_customer3]


@pytest.fixture
def sample_sell_file(db, sample_user):
    sell1 = Sell.objects.create(
        owner_name="Owner 1",
        owner_phone="09123456789",
        address="Address 1",
        m2=90,
        price=2800,
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

    return sell1


@pytest.fixture
def sample_buy_customers(db, sample_user):
    # customers have more or same budget as the file price
    buy_customer1 = BuyCustomer.objects.create(
        customer_name="Jane Doe",
        customer_phone="09123456789",
        property_type=BuyCustomer.Types.APARTEMANT,
        budget=3000,
        m2=100,
        year=2020,
        bedroom=3,
        vahedha=1,
        added_by=sample_user,  # Reference the created user
        parking=True,
        elevator=False,
        storage=True,
        date="2024-11-29",
    )
    buy_customer2 = BuyCustomer.objects.create(
        customer_name="Jane Doe",
        customer_phone="09123456789",
        property_type=BuyCustomer.Types.APARTEMANT,
        budget=8000,
        m2=100,
        year=2020,
        bedroom=3,
        vahedha=1,
        added_by=sample_user,  # Reference the created user
        parking=True,
        elevator=False,
        storage=True,
        date="2024-11-29",
    )
    buy_customer3 = BuyCustomer.objects.create(
        customer_name="Jane Doe",
        customer_phone="09123456789",
        property_type=BuyCustomer.Types.APARTEMANT,
        budget=5500,
        m2=100,
        year=2020,
        bedroom=3,
        vahedha=1,
        added_by=sample_user,  # Reference the created user
        parking=True,
        elevator=False,
        storage=True,
        date="2024-11-29",
    )

    return [buy_customer1, buy_customer2, buy_customer3]


@pytest.mark.django_db
def test_get_related_customers(sample_rent_file, sample_rent_customers):
    related_customers = sample_rent_file.get_related_customers()

    # Print the name of the first related customer
    print(related_customers[0].customer_name)

    # Assert that only unnotified customers are returned
    assert len(related_customers) == 2  # Adjust based on your logic
    assert related_customers[0].customer_name == "Jane Doe"  # Use dot notation

    # Asserting budget range
    assert related_customers[0].up_budget * 1.25 >= sample_rent_file.price_up
    assert related_customers[0].up_budget * 0.75 <= sample_rent_file.price_up
    assert related_customers[0].rent_budget * 1.25 >= sample_rent_file.price_rent
    assert related_customers[0].rent_budget * 0.75 <= sample_rent_file.price_rent


@pytest.mark.django_db
def test_rent_related_customers_view(
    api_client, sample_rent_file, sample_rent_customers
):
    # TODO: other fields in serializer should be tested in this teest
    id = sample_rent_file.id
    url = f"http://localhost:8000/api/file/rent/{id}/related_customers/"

    response: List[RentCustomer] = api_client.get(url)
    print(response.data)

    assert response.status_code == 200

    assert len(response.data) == 2

    # asseritng budget range
    assert response.data[0]["up_budget"] * 1.25 >= sample_rent_file.price_up
    assert response.data[0]["up_budget"] * 0.75 <= sample_rent_file.price_up
    assert response.data[0]["rent_budget"] * 1.25 >= sample_rent_file.price_rent
    assert response.data[0]["rent_budget"] * 0.75 <= sample_rent_file.price_rent


@pytest.mark.django_db
def test_get_sell_related_customers(sample_sell_file, sample_buy_customers):
    related_customers = sample_sell_file.get_related_customers()

    # Print the name of the first related customer
    print(related_customers[0].customer_name)

    # Assert that only unnotified customers are returned
    # assert len(related_customers) == 1
    print("len: ", len(related_customers))
    assert related_customers[0].customer_name == "Jane Doe"

    # Asserting budget range
    assert related_customers[0].budget * 1.25 >= sample_sell_file.price
    assert related_customers[0].budget * 0.75 <= sample_sell_file.price


@pytest.mark.django_db
def test_sell_related_customers_view(
    api_client, sample_sell_file, sample_buy_customers
):
    # TODO: other fields in serializer should be tested in this teest
    id = sample_sell_file.id
    url = f"http://localhost:8000/api/file/sell/{id}/related_customers/"

    response: List[BuyCustomer] = api_client.get(url)
    print(response.data)

    assert response.status_code == 200

    assert len(response.data) == 1

    # asseritng budget range
    assert response.data[0]["budget"] * 1.25 >= sample_sell_file.price
    assert response.data[0]["budget"] * 0.75 <= sample_sell_file.price
