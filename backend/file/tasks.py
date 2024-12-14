from celery import shared_task
from .models import Sell, Rent
from logs.models import SMSLog
import requests


@shared_task
def send_sell_message(phone_numbers, pk) -> bool:
    file = Sell.objects.get(pk=pk)

    elevator = "دارد" if file.elevator else "ندارد"
    storage = "دارد" if file.storage else "ندارد"
    parking = "دارد" if file.parking else "ندارد"

    sell_template = f"""
    آدرس : {file.address}
    متراژ: {file.m2}
    قیمت: {file.price}
    طبقه: {file.floor}
    آسانسور: {elevator}
    پارکینگ: {parking}
    انباری: {storage}
    """

    url = "http://192.168.1.102:8080/message"
    data = {
        "message": sell_template,
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
        task_id=send_sell_message.request.id,
        status=success,
        message=data["message"],
        phone_number=phone_numbers,
    )

    return success


@shared_task
def send_rent_message(phone_numbers, pk):
    file = Rent.objects.get(pk=pk)

    elevator = "دارد" if file.elevator else "ندارد"
    storage = "دارد" if file.storage else "ندارد"
    parking = "دارد" if file.parking else "ندارد"

    price_up = (
        f"میلیون{file.price_up}"
        if file.price_up < 1000
        else f"میلیارد{int(file.price_up / 1000)}"
    )

    rent_template = f"""
    آدرس : {file.address}
    متراژ: {file.m2}
    ودیعه: {price_up}
    اجاره: میلیون {int(file.price_rent)}
    طبقه: {file.floor}
    آسانسور: {elevator}
    پارکینگ: {parking}
    انباری: {storage}
    """

    url = "http://192.168.1.102:8080/message"
    data = {
        "message": rent_template,
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
        task_id=send_rent_message.request.id,
        status=success,
        message=data["message"],
        phone_number=phone_numbers,
    )

    return success
