import pytest
from file.models import Sell, Rent
from customer.models import BuyCustomer, RentCustomer


@pytest.mark.django_db
def test_rent_file_delete(api_client, sample_rent_file, db):

    sample_file_id = sample_rent_file.id
    url = f"http://localhost:8000/api/file/rent/{sample_file_id}/"
    response = api_client.delete(url)

    # getting the file after the delete call
    file = Rent.objects.get(pk=sample_file_id)

    assert response.status_code == 204
    assert file.status == Rent.Status.UNACTIVE


@pytest.mark.django_db
def test_sell_file_delete(api_client, sample_sell_file, db):

    sample_file_id = sample_sell_file.id
    url = f"http://localhost:8000/api/file/sell/{sample_file_id}/"
    response = api_client.delete(url)

    # getting the file after the delete call
    file = Sell.objects.get(pk=sample_file_id)

    assert response.status_code == 204
    assert file.status == Rent.Status.UNACTIVE


@pytest.mark.django_db
def test_rent_customer_delete(api_client, sample_rent_customer, db):

    sample_customer_id = sample_rent_customer.id
    url = f"http://localhost:8000/api/customer/rent/{sample_customer_id}/"
    response = api_client.delete(url)

    # getting the file after the delete call
    customer = RentCustomer.objects.get(pk=sample_customer_id)

    assert response.status_code == 204
    assert customer.status == Rent.Status.UNACTIVE


@pytest.mark.django_db
def test_buy_customer_delete(api_client, sample_buy_customer, db):

    sample_file_id = sample_buy_customer.id
    url = f"http://localhost:8000/api/customer/buy/{sample_file_id}/"
    response = api_client.delete(url)

    # getting the file after the delete call
    customer = BuyCustomer.objects.get(pk=sample_file_id)

    assert response.status_code == 204
    assert customer.status == Rent.Status.UNACTIVE
