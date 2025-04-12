import pytest
from file.serializers import SellFileSerializer, RentFileSerializer


@pytest.mark.django_db
def test_get_sell_related_files(sample_buy_customer, sample_sells):
    related_files = sample_buy_customer.get_related_files()

    # Assert that only unnotified files are returned
    assert len(related_files) == 1  # Only sell2 should be returned
    assert (
        related_files[0].owner_name == "Owner 2"
    )  # Check the name of the returned file


@pytest.mark.django_db
def test_buy_customer_related_files_view(api_client, sample_buy_customer, sample_sells):
    url = "http://localhost:8000/api/customer/buy/10/related_files/"

    response = api_client.get(url)

    assert response.status_code == 200

    # Deserialize response data to check against expected values
    serializer = SellFileSerializer(sample_sells[1])  # Only sell2 should be returned
    assert response.data == [serializer.data]


@pytest.mark.django_db
def test_get_related_files(sample_rent_customer, sample_rents):
    related_files = sample_rent_customer.get_related_files()

    # Assert that only unnotified files are returned
    assert len(related_files) == 1  # Only rent2 should be returned
    assert (
        related_files[0].owner_name == "Owner 2"
    )  # Check the name of the returned file


@pytest.mark.django_db
def test_rent_customer_related_files_view(client, sample_rent_customer, sample_rents):
    url = "http://localhost:8000/api/customer/rent/10/related_files/"

    response = client.get(url)

    assert response.status_code == 200

    # Deserialize response data to check against expected values
    serializer = RentFileSerializer(sample_rents[1])  # Only rent2 should be returned
    assert response.data == [serializer.data]
