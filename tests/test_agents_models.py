import pytest
from django.contrib.auth.models import User

#SECTION - fixtures
@pytest.fixture(scope='function')
def user(db) -> User:
    user = User.objects.create_user(username='test',
                                    email='test@test.com',
                                    password='test')
    return user
#!SECTION


#SECTION - Create
@pytest.mark.django_db
def test_create_User() -> None:
    #NOTE tests creation of a User
    user = User.objects.create_user(username='test',
                                    email='test',
                                    password='test',
                                    )
    assert user
#!SECTION

#SECTION - Update
def test_update_User(user: User) -> None:
    #NOTE - test for User update 
    user.username = 'updated test'
    assert user.username is 'updated test'
#!SECTION

#SECTION - Read
def test_read_User(user: User) -> None:
    # assert user.email is 'test@test.com'
    assert user.username is 'test'
#!SECTION

#SECTION - Delete
def test_delete_User(user: User) -> None:
    user = User.objects.filter(username='test').get()
    deleted = user.delete()
    assert deleted
#!SECTION