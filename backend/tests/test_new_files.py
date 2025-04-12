import pytest


@pytest.mark.django_db
def test_create_rent_file(api_client, sample_user):
    # Define the JSON payload for the new rental property
    payload = {
        "username": "test",
        "file_type": "rent",
        "property_type": "A",
        "date": "2024-11-28",
        "updated": "2024-11-28",
        "address": "test",
        "m2": 65,
        "year": 651,
        "bedroom": 1651,
        "price_up": 545,
        "price_rent": 65165,
        "tabdil": None,
        "floor": 6,
        "tabaghat": 51,
        "vahedha": 65,
        "parking": False,
        "elevator": False,
        "storage": False,
        "parking_motor": False,
        "owner_name": "51",
        "owner_phone": "51651656516",
        "bazdid": "هماهنگی",
        "tenet_name": None,
        "tenet_phone": None,
        "lobbyMan_name": None,
        "lobbyMan_phone": None,
        "description": "651651",
    }

    url = "http://localhost:8000/api/file/rent/new/"
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == 201

    # Full assertions for returned data
    assert response.data["file_type"] == payload["file_type"]
    assert response.data["property_type"] == payload["property_type"]
    assert response.data["address"] == payload["address"]
    assert response.data["m2"] == payload["m2"]
    assert response.data["year"] == payload["year"]
    assert response.data["bedroom"] == payload["bedroom"]
    assert response.data["price_up"] == payload["price_up"]
    assert response.data["price_rent"] == payload["price_rent"]
    assert response.data["tabdil"] == payload["tabdil"]
    assert response.data["floor"] == payload["floor"]
    assert response.data["tabaghat"] == payload["tabaghat"]
    assert response.data["vahedha"] == payload["vahedha"]
    assert response.data["parking"] == payload["parking"]
    assert response.data["elevator"] == payload["elevator"]
    assert response.data["storage"] == payload["storage"]
    assert response.data["parking_motor"] == payload["parking_motor"]
    assert response.data["owner_name"] == payload["owner_name"]
    assert response.data["owner_phone"] == payload["owner_phone"]
    assert response.data["bazdid"] == payload["bazdid"]
    assert response.data["tenet_name"] == payload["tenet_name"]
    assert response.data["tenet_phone"] == payload["tenet_phone"]
    assert response.data["description"] == payload["description"]
    assert response.data["date"] == payload["date"]


@pytest.mark.django_db
def test_create_sell_file(api_client, sample_user):
    # Define the JSON payload for the new rental property
    payload = {
        "username": "test",
        "file_type": "sell",
        "property_type": "A",
        "date": "2024-11-28",
        "updated": "2024-11-28",
        "address": "test",
        "m2": 65,
        "year": 651,
        "bedroom": 1651,
        "price": 18000,
        "floor": 6,
        "tabaghat": 51,
        "vahedha": 65,
        "parking": False,
        "elevator": False,
        "storage": False,
        "parking_motor": False,
        "owner_name": "51",
        "owner_phone": "51651656516",
        "bazdid": "هماهنگی",
        "tenet_name": None,
        "tenet_phone": None,
        "lobbyMan_name": None,
        "lobbyMan_phone": None,
        "description": "651651",
    }

    url = "http://localhost:8000/api/file/sell/new/"
    response = api_client.post(url, data=payload, format="json")

    assert response.status_code == 201

    # Full assertions for returned data
    assert response.data["file_type"] == payload["file_type"]
    assert response.data["property_type"] == payload["property_type"]
    assert response.data["address"] == payload["address"]
    assert response.data["m2"] == payload["m2"]
    assert response.data["year"] == payload["year"]
    assert response.data["bedroom"] == payload["bedroom"]
    assert response.data["price"] == payload["price"]
    assert response.data["floor"] == payload["floor"]
    assert response.data["tabaghat"] == payload["tabaghat"]
    assert response.data["vahedha"] == payload["vahedha"]
    assert response.data["parking"] == payload["parking"]
    assert response.data["elevator"] == payload["elevator"]
    assert response.data["storage"] == payload["storage"]
    assert response.data["parking_motor"] == payload["parking_motor"]
    assert response.data["owner_name"] == payload["owner_name"]
    assert response.data["owner_phone"] == payload["owner_phone"]
    assert response.data["bazdid"] == payload["bazdid"]
    assert response.data["tenet_name"] == payload["tenet_name"]
    assert response.data["tenet_phone"] == payload["tenet_phone"]
    assert response.data["description"] == payload["description"]
    assert response.data["date"] == payload["date"]
