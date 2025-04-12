import pytest


@pytest.mark.django_db
def test_update_rent_file(api_client, sample_user, sample_rent_file):
    """Test updating an existing rent file."""
    # Define the updated JSON payload for the rental property
    updated_payload = {
        "username": "test",
        "property_type": "A",
        "date": "2024-12-01",
        "updated": "2024-12-01",
        "address": "updated_test",
        "m2": 70,
        "year": 700,
        "bedroom": 2,
        "price_up": 600,
        "price_rent": 70000,
        "tabdil": None,
        "floor": 5,
        "tabaghat": 52,
        "vahedha": 70,
        "parking": True,
        "elevator": True,
        "storage": True,
        "parking_motor": True,
        "owner_name": "Updated Owner",
        "owner_phone": "1234567890",
        "bazdid": "Updated Coordination",
        "tenet_name": None,
        "tenet_phone": None,
        "lobbyMan_name": None,
        "lobbyMan_phone": None,
        "description": "Updated description.",
    }

    url = f"http://localhost:8000/api/file/rent/{sample_rent_file.id}/"
    response = api_client.put(url, data=updated_payload, format="json")

    assert response.status_code == 200

    # Full assertions for returned data
    assert response.data["property_type"] == updated_payload["property_type"]
    assert response.data["address"] == updated_payload["address"]
    assert response.data["m2"] == updated_payload["m2"]
    assert response.data["year"] == updated_payload["year"]
    assert response.data["bedroom"] == updated_payload["bedroom"]
    assert response.data["price_up"] == updated_payload["price_up"]
    assert response.data["price_rent"] == updated_payload["price_rent"]
    assert response.data["tabdil"] == updated_payload["tabdil"]
    assert response.data["floor"] == updated_payload["floor"]
    assert response.data["tabaghat"] == updated_payload["tabaghat"]
    assert response.data["vahedha"] == updated_payload["vahedha"]
    assert response.data["parking"] == updated_payload["parking"]
    assert response.data["elevator"] == updated_payload["elevator"]
    assert response.data["storage"] == updated_payload["storage"]
    assert response.data["parking_motor"] == updated_payload["parking_motor"]
    assert response.data["owner_name"] == updated_payload["owner_name"]
    assert response.data["owner_phone"] == updated_payload["owner_phone"]
    assert response.data["bazdid"] == updated_payload["bazdid"]
    assert response.data["tenet_name"] == updated_payload["tenet_name"]
    assert response.data["tenet_phone"] == updated_payload["tenet_phone"]
    assert response.data["description"] == updated_payload["description"]
    assert response.data["date"] == updated_payload["date"]


@pytest.mark.django_db
def test_update_sell_file(api_client, sample_user, sample_sell_file):
    """Test updating an existing sell file."""
    # Define the updated JSON payload for the selling property
    updated_payload = {
        "username": "test",
        "property_type": "A",
        "date": "2024-12-01",
        "updated": "2024-12-01",
        "address": "updated_test",
        "m2": 70,
        "year": 700,
        "bedroom": 2,
        "price": 20000,
        "floor": 5,
        "tabaghat": 52,
        "vahedha": 70,
        "parking": True,
        "elevator": True,
        "storage": True,
        "parking_motor": True,
        "owner_name": "Updated Owner",
        "owner_phone": "1234567890",
        "bazdid": "Updated Coordination",
        "tenet_name": None,
        "tenet_phone": None,
        "lobbyMan_name": None,
        "lobbyMan_phone": None,
        "description": "Updated description.",
    }

    url = f"http://localhost:8000/api/file/sell/{sample_sell_file.id}/"
    response = api_client.put(url, data=updated_payload, format="json")

    if not response.status_code == 200:
        print("response data:\n", response.data)
    assert response.status_code == 200

    # Full assertions for returned data
    assert response.data["property_type"] == updated_payload["property_type"]
    assert response.data["address"] == updated_payload["address"]
    assert response.data["m2"] == updated_payload["m2"]
    assert response.data["year"] == updated_payload["year"]
    assert response.data["bedroom"] == updated_payload["bedroom"]
    assert response.data["price"] == updated_payload["price"]
    assert response.data["floor"] == updated_payload["floor"]
    assert response.data["tabaghat"] == updated_payload["tabaghat"]
    assert response.data["vahedha"] == updated_payload["vahedha"]
    assert response.data["parking"] == updated_payload["parking"]
    assert response.data["elevator"] == updated_payload["elevator"]
    assert response.data["storage"] == updated_payload["storage"]
    assert response.data["parking_motor"] == updated_payload.get("parking_motor", False)
    assert response.data.get("owner_name") == updated_payload.get("owner_name")
    assert response.data.get("owner_phone") == updated_payload.get("owner_phone")
    assert response.data.get("bazdid") == updated_payload.get("bazdid")
    assert response.data.get("tenet_name") == updated_payload.get("tenet_name")
    assert response.data.get("tenet_phone") == updated_payload.get("tenet_phone")
    assert response.data.get("description") == updated_payload.get("description")
