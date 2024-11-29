import pytest


@pytest.mark.django_db
def test_create_buy_customer(api_client, sample_user):
    # Define the JSON payload for the new rental property
    payload = {
        "username": "test",
        "customer_type": "buy",
        "property_type": "A",
        "date": "2024-11-28",
        "updated": "2024-11-28",
        "m2": 16,
        "year": 516,
        "bedroom": 51,
        "budget": 165,
        "vahedha": 61,
        "parking": False,
        "elevator": True,
        "storage": False,
        "parking_motor": False,
        "customer_name": "1616",
        "customer_phone": "15615615165",
        "description": "something",
    }

    url = "http://localhost:8000/api/customer/buy/new/"
    response = api_client.post(url, data=payload, format="json")

    if response.status_code != 201:
        print("data: \n", response.data)

    assert response.status_code == 201

    # Full assertions for returned data
    assert response.data["customer_type"] == payload["customer_type"]
    assert response.data["property_type"] == payload["property_type"]
    assert response.data["m2"] == payload["m2"]
    assert response.data["year"] == payload["year"]
    assert response.data["bedroom"] == payload["bedroom"]
    assert response.data["budget"] == payload["budget"]
    assert response.data["vahedha"] == payload["vahedha"]
    assert response.data["parking"] == payload["parking"]
    assert response.data["elevator"] == payload["elevator"]
    assert response.data["storage"] == payload["storage"]
    assert response.data["parking_motor"] == payload["parking_motor"]
    assert response.data["customer_name"] == payload["customer_name"]
    assert response.data["customer_phone"] == payload["customer_phone"]
    assert response.data["description"] == payload["description"]
    assert response.data["date"] == payload["date"]


@pytest.mark.django_db
def test_create_rent_customer(api_client, sample_user):
    # Define the JSON payload for the new rental property
    payload = {
        "username": "test",
        "customer_type": "rent",
        "property_type": "A",
        "date": "2024-11-28",
        "updated": "2024-11-28",
        "m2": 61,
        "year": 65,
        "bedroom": 16,
        "up_budget": 56165,
        "rent_budget": 651,
        "vahedha": 1,
        "parking": True,
        "elevator": False,
        "storage": False,
        "parking_motor": False,
        "customer_name": "6516",
        "customer_phone": "65161651651",
        "description": "51",
    }

    url = "http://localhost:8000/api/customer/rent/new/"
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == 201

    # Full assertions for returned data
    assert response.data["customer_type"] == payload["customer_type"]
    assert response.data["property_type"] == payload["property_type"]
    assert response.data["m2"] == payload["m2"]
    assert response.data["year"] == payload["year"]
    assert response.data["bedroom"] == payload["bedroom"]
    assert response.data["up_budget"] == payload["up_budget"]
    assert response.data["rent_budget"] == payload["rent_budget"]
    assert response.data["vahedha"] == payload["vahedha"]
    assert response.data["parking"] == payload["parking"]
    assert response.data["elevator"] == payload["elevator"]
    assert response.data["storage"] == payload["storage"]
    assert response.data["parking_motor"] == payload["parking_motor"]
    assert response.data["customer_name"] == payload["customer_name"]
    assert response.data["customer_phone"] == payload["customer_phone"]
    assert response.data["description"] == payload["description"]
    assert response.data["date"] == payload["date"]
