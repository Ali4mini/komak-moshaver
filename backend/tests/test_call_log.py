import pytest


@pytest.mark.django_db
def test_rent_file_call_log(api_client, sample_rent_file, sample_rent_customer):
    url = "http://localhost:8000/api/logs/rent-call/"
    payload = {
        "username": "test",
        "file": sample_rent_file.id,
        "customer": sample_rent_customer.id,
        "description": "test description",
        "subject": "P",
    }

    response = api_client.post(url, payload)

    assert response.status_code == 201

    assert response.json().get("file") == payload.get("file")
    assert response.json().get("customer") == payload.get("customer")
    assert response.json().get("description") == payload.get("description")

    # check if it has added the datatime data automatically
    assert response.json().get("created")
    assert response.json().get("updated")


@pytest.mark.django_db
def test_sell_file_call_log(api_client, sample_sell_file, sample_buy_customer):
    url = "http://localhost:8000/api/logs/sell-call/"
    payload = {
        "username": "test",
        "file": sample_sell_file.id,
        "customer": sample_buy_customer.id,
        "description": "test description",
        "subject": "P",
    }

    response = api_client.post(url, payload)

    assert response.status_code == 201

    assert response.json().get("file") == payload.get("file")
    assert response.json().get("customer") == payload.get("customer")
    assert response.json().get("description") == payload.get("description")

    # check if it has added the datatime data automatically
    assert response.json().get("created")
    assert response.json().get("updated")
