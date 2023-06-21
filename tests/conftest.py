import pytest
from django.contrib.auth.models import User

@pytest.fixture(scope='module')
def user(db):
    user = User.objects.create_user('test', 'test@test.com', 'test')
