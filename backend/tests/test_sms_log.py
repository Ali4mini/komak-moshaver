import pytest
from rest_framework import status
from logs.models import SMSLog

# TODO: resend_message test


@pytest.fixture
def sample_sms_log(db):
    sms_log = SMSLog.objects.create(
        task_id="12345",
        status=True,
        message="Test message",
        phone_number="+1234567890",
    )

    return sms_log


@pytest.mark.django_db
def test_sms_log_creation(db):
    sms_log = SMSLog.objects.create(
        task_id="12345",
        status=True,
        message="Test message",
        phone_number="+1234567890",
    )

    assert sms_log.task_id == "12345"
    assert sms_log.status is True
    assert sms_log.message == "Test message"
    assert sms_log.phone_number == "+1234567890"
    assert sms_log.created_at is not None


@pytest.mark.django_db
def test_create_sms_log(api_client, db):
    response = api_client.post(
        "http://localhost:8000/api/logs/smsLogs/",
        {
            "task_id": "67890",
            "status": True,
            "message": "Another test message",
            "phone_number": "+0987654321",
        },
    )

    assert response.status_code == 201
    assert SMSLog.objects.count() == 1
    assert SMSLog.objects.get().task_id == "67890"


@pytest.mark.django
def test_list_sms_logs(api_client, db):
    SMSLog.objects.create(
        task_id="11111",
        status=True,
        message="First log",
        phone_number="+1111111111",
    )
    SMSLog.objects.create(
        task_id="22222",
        status=False,
        message="Second log",
        phone_number="+2222222222",
    )

    response = api_client.get("http://localhost:8000/api/logs/smsLogs/")

    assert response.status_code == 200
    assert len(response.data) == 2


@pytest.mark.django
def test_ordering_of_sms_logs(api_client, db):
    SMSLog.objects.create(
        task_id="33333",
        status=True,
        message="Third log",
        phone_number="9211000000",
    )
    SMSLog.objects.create(
        task_id="44444",
        status=False,
        message="Fourth log",
        phone_number="+4444444444",
    )

    response = api_client.get("http://localhost:8000/api/logs/smsLogs/")

    assert response.status_code == 200
    # Check if the logs are ordered by id (descending)
    assert response.data[0]["task_id"] == "44444"


@pytest.mark.django
def test_resend_sms(api_client, sample_sms_log):
    url = f"http://localhost:8000/api/logs/smsLogs/{sample_sms_log.id}/resend/"

    res = api_client.post(url)

    assert res.status_code == 200
