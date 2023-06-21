import pytest
from django.test import Client
from django.contrib.auth.models import User
from django.urls import reverse_lazy, reverse

#SECTION - fixtures
@pytest.fixture(scope='function')
def user(db) -> User:
    user = User.objects.create_user('test', 'test@test.com', 'test')
    return user
#!SECTION

def test_getting_without_authentication() -> None:
    '''
    endpoint: new_file
    method: GET
    authentication: None
    '''
    url = reverse('file:new_file')
    client = Client()
    response = client.get(url)
    assert response.status_code == 302
    
def test_getting_with_authentication(user: User) -> None: 
    '''
    endpoint: new_file
    method: GET
    authentication: True
    '''    
    url = reverse_lazy('file:new_file')
    client = Client()
    client.login(username=user.username, password='test')
    response = client.get(url, follow=False)
    assert response.status_code == 200



