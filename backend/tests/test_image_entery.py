import pytest
import os
from file.models import SellImage, RentImage


@pytest.mark.django_db
def test_upload_single_sell_image_success(api_client, sample_sell_file):
    """Test successful image upload with a single file."""
    cwd = os.getcwd()
    image_path = os.path.join(cwd, "tests/1.png")
    url = f"http://localhost:8000/api/file/sell/{sample_sell_file.id}/images/"

    with open(image_path, "rb") as image_file:
        response = api_client.post(
            url,
            data={"images": image_file},
            format="multipart",
        )

    if not response.status_code == 201:
        print("response data:\n", response.data)

    assert response.status_code == 201
    assert SellImage.objects.filter(file=sample_sell_file).count() == 1


@pytest.mark.django_db
def test_upload_multiple_sell_images_success(api_client, sample_sell_file):
    """Test successful image upload with multiple files."""
    cwd = os.getcwd()
    image_paths = [
        os.path.join(cwd, "tests/1.png"),
        os.path.join(cwd, "tests/2.png"),
        os.path.join(cwd, "tests/3.png"),
    ]

    url = f"http://localhost:8000/api/file/sell/{sample_sell_file.id}/images/"

    # Prepare the files for upload
    images = [open(image_path, "rb") for image_path in image_paths]

    response = api_client.post(
        url,
        data={"images": images},
        format="multipart",
    )

    # Close the files after the request
    for image in images:
        image.close()

    if not response.status_code == 201:
        print("response data:\n", response.data)

    assert response.status_code == 201
    assert SellImage.objects.filter(file=sample_sell_file).count() == len(image_paths)


@pytest.mark.django_db
def test_upload_single_rent_image_success(api_client, sample_rent_file):
    """Test successful image upload with a single file."""
    cwd = os.getcwd()
    image_path = os.path.join(cwd, "tests/1.png")
    url = f"http://localhost:8000/api/file/rent/{sample_rent_file.id}/images/"

    with open(image_path, "rb") as image_file:
        response = api_client.post(
            url,
            data={"images": image_file},
            format="multipart",
        )

    if not response.status_code == 201:
        print("response data:\n", response.data)

    assert response.status_code == 201
    assert RentImage.objects.filter(file=sample_rent_file).count() == 1


@pytest.mark.django_db
def test_upload_multiple_rent_images_success(api_client, sample_rent_file):
    """Test successful image upload with multiple files."""
    cwd = os.getcwd()
    image_paths = [
        os.path.join(cwd, "tests/1.png"),
        os.path.join(cwd, "tests/2.png"),
        os.path.join(cwd, "tests/3.png"),
    ]

    url = f"http://localhost:8000/api/file/rent/{sample_rent_file.id}/images/"

    # Prepare the files for upload
    images = [open(image_path, "rb") for image_path in image_paths]

    response = api_client.post(
        url,
        data={"images": images},
        format="multipart",
    )

    # Close the files after the request
    for image in images:
        image.close()

    if not response.status_code == 201:
        print("response data:\n", response.data)

    assert response.status_code == 201
    assert RentImage.objects.filter(file=sample_rent_file).count() == len(image_paths)


@pytest.mark.django_db
def test_upload_single_sell_image_url(api_client, sample_sell_file):
    """Test successful image upload with a single URL."""
    url = f"http://localhost:8000/api/file/sell/{sample_sell_file.id}/images/"

    response = api_client.post(
        url,
        data={
            "image_urls": [
                "https://upload.wikimedia.org/wikipedia/commons/6/6a/PNG_Test.png"
            ],
        },
        format="multipart",
    )

    if not response.status_code == 201:
        print("response data:\n", response.data)

    assert response.status_code == 201
    assert SellImage.objects.filter(file=sample_sell_file).count() == 1


@pytest.mark.django_db
def test_upload_multiple_sell_image_urls(api_client, sample_sell_file):
    """Test successful image upload with multiple URLs."""
    url = f"http://localhost:8000/api/file/sell/{sample_sell_file.id}/images/"

    image_urls = [
        "https://upload.wikimedia.org/wikipedia/commons/6/6a/PNG_Test.png",
        "https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg",
    ]

    response = api_client.post(
        url,
        data={"image_urls": image_urls},
        format="multipart",
    )

    if not response.status_code == 201:
        print("response data:\n", response.data)

    assert response.status_code == 201
    assert SellImage.objects.filter(file=sample_sell_file).count() == len(image_urls)


@pytest.mark.django_db
def test_upload_single_rent_image_url(api_client, sample_rent_file):
    """Test successful image upload with a single URL."""
    url = f"http://localhost:8000/api/file/rent/{sample_rent_file.id}/images/"

    response = api_client.post(
        url,
        data={
            "image_urls": [
                "https://upload.wikimedia.org/wikipedia/commons/6/6a/PNG_Test.png"
            ],
        },
        format="multipart",
    )

    if not response.status_code == 201:
        print("response data:\n", response.data)

    assert response.status_code == 201
    assert RentImage.objects.filter(file=sample_rent_file).count() == 1


@pytest.mark.django_db
def test_upload_multiple_rent_image_urls(api_client, sample_rent_file):
    """Test successful image upload with multiple URLs."""
    url = f"http://localhost:8000/api/file/rent/{sample_rent_file.id}/images/"
    image_urls = [
        "https://upload.wikimedia.org/wikipedia/commons/6/6a/PNG_Test.png",
        "https://upload.wikimedia.org/wikipedia/commons/a/a9/Example.jpg",
    ]

    response = api_client.post(
        url,
        data={"image_urls": image_urls},
        format="multipart",
    )

    if not response.status_code == 201:
        print("response data:\n", response.data)

    assert response.status_code == 201
    assert RentImage.objects.filter(file=sample_rent_file).count() == len(image_urls)
