from celery import shared_task
from .models import Sell, Rent
import requests
from logs.models import SMSLog
from typing import Dict, List
import json
import os


@shared_task
def geocoding(
    address: str, prefix="تهران منطقه ۱۴ خیابان خاوران"
) -> Dict[str, str] | None:
    """it returns the x and y points of an address"""
    API_KEY = os.getenv("NESHAN_SERVICES_API")
    final_address = prefix + address
    headers = {
        "Api-Key": API_KEY,
    }
    res = requests.get(
        f"https://api.neshan.org/v6/geocoding?address={final_address}", headers=headers
    )

    print(res)
    parsed_data = json.loads(res.text)

    return parsed_data["location"]


@shared_task
def download_static_location(
    lat: float,
    lon: float,
    width: int = 620,
    height: int = 400,
    zoom: int = 16,
    markerToken: str | None = "31018.16ET1D5zF",
) -> bytes | None:
    """Downloads the static location of a point from the Neshan API and adds the image to the instance."""

    API_KEY = os.getenv("NESHAN_STATIC_MAP_API")

    api_url = f"https://api.neshan.org/v4/static?key={API_KEY}&type=neshan&width={width}&height={height}&zoom={zoom}&center={lon},{lat}&markerToken={markerToken}"

    result = requests.get(api_url)

    if result.status_code == 200:
        # location_file = ContentFile(result.content, name=image_name)

        return result.content
    else:
        print("Error!\nThe status code was:", result.status_code)
        print("Error content:", result.content)

        return


@shared_task
def send_message(phone_numbers: List[str], file: Sell | Rent) -> bool:

    def get_message(file: Sell | Rent) -> str:
        elevator = "دارد" if file.elevator else "ندارد"
        storage = "دارد" if file.storage else "ندارد"
        parking = "دارد" if file.parking else "ندارد"

        if file.get_file_type == "sell":
            template = f"""
            آدرس : {file.address}
            متراژ: {file.m2}
            قیمت: {file.price}
            طبقه: {file.floor}
            آسانسور: {elevator}
            پارکینگ: {parking}
            انباری: {storage}
            """
        else:
            template = f"""
            آدرس : {file.address}
            متراژ: {file.m2}
            ودیعه: {file.price_up}
            اجاره: میلیون {int(file.price_rent)}
            طبقه: {file.floor}
            آسانسور: {elevator}
            پارکینگ: {parking}
            انباری: {storage}
            """

        return template

    message = get_message(file)
    url = "http://192.168.1.102:8080/message"
    data = {
        "message": message,
        "phoneNumbers": [phone_numbers],
        "simNumber": 1,
    }

    try:

        response = requests.post(
            url,
            json=data,
            auth=requests.auth.HTTPBasicAuth("sms", "ggQ7iEXY"),
            headers={"Content-Type": "application/json"},
        )

        success: bool = response.status_code == 202
    except:
        success: bool = False

    # creating new record on SMSLog table
    SMSLog.objects.create(
        task_id=send_message.request.id,
        status=success,
        message=data["message"],
        phone_number=phone_numbers,
    )

    return success


@shared_task
def resend_message(phone_number: str, message: str) -> bool:

    url = "http://192.168.1.102:8080/message"
    data = {
        "message": message,
        "phoneNumbers": [phone_number],
        "simNumber": 1,
    }

    try:

        response = requests.post(
            url,
            json=data,
            auth=requests.auth.HTTPBasicAuth("sms", "ggQ7iEXY"),
            headers={"Content-Type": "application/json"},
        )

        success: bool = response.status_code == 202
    except:
        success: bool = False

    print("request id: \n", resend_message.request.id)
    # creating new record on SMSLog table
    SMSLog.objects.create(
        task_id=resend_message.request.id,
        status=success,
        message=data["message"],
        phone_number=phone_number,
    )

    return success
