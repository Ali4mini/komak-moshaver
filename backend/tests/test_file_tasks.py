import pytest
from file.tasks import geocoding, download_static_location


def test_geocoding():
    address = "تهران منطقه ۱۴ خیابان عارف جنوبی - کوچه امام زمان پلاک44"

    res = geocoding(address)

    assert res == {"x": 51.452348555990206, "y": 35.66555282093095}


def test_download_static_location():
    location = {"x": 51.452348555990206, "y": 35.66555282093095}

    res = download_static_location(location["x"], location["y"])

    assert type(res) is bytes
