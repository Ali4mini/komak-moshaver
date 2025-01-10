import pytest


@pytest.mark.django_db
def test_new_sell_location(api_client, sample_sell_file):
    """test for new location"""
    url = f"http://localhost:8000/api/file/sell/{sample_sell_file.id}/location/"

    response = api_client.post(
        url,
        data={
            "file": sample_sell_file.id,
            "location": {
                "latitude": 51.480237999596184,
                "longitude": 35.67718207057902,
            },
        },
        format="json",
    )

    if not response.status_code == 404:
        print("response data:\n", response.data)

    assert response.status_code == 201


@pytest.mark.django_db
def test_new_rent_location(api_client, sample_rent_file):
    """test for new rent location"""
    url = f"http://localhost:8000/api/file/rent/{sample_rent_file.id}/location/"

    response = api_client.post(
        url,
        data={
            "file": sample_rent_file.id,
            "location": {
                "latitude": 51.480237999596184,
                "longitude": 35.67718207057902,
            },
        },
        format="json",
    )

    if not response.status_code == 404:
        print("response data:\n", response.data)

    assert response.status_code == 201


def test_get_sell_static_location(api_client, sample_sell_location):

    url = (
        f"http://localhost:8000/api/file/sell/{sample_sell_location.file.id}/location/"
    )

    response = api_client.get(url)

    print("data: \n", response.data)
    assert response.status_code == 200
    assert response.data["location"] == sample_sell_location.location
    assert response.data["image"] is not None


def test_get_rent_static_location(api_client, sample_rent_location):

    url = (
        f"http://localhost:8000/api/file/rent/{sample_rent_location.file.id}/location/"
    )
    print("url: \n", url)

    response = api_client.get(url)

    print("data: \n", response.data)
    assert response.status_code == 200
    assert response.data["location"] == sample_rent_location.location
    assert response.data["image"] is not None
