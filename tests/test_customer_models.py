import pytest
from django.contrib.auth.models import User
from customer.models import BuyCustomer, RentCustomer, BuyComment, RentComment

#SECTION - fixtures
@pytest.fixture(scope='function')
def user(db) -> User:
    user = User.objects.create_user(username='test',
                                    email='test@test.com',
                                    password='test')
    return user


@pytest.fixture(scope='function')
def buy_customer(db, user) -> BuyCustomer:
    customer = BuyCustomer.objects.create(customer_name='test',
                                          customer_phone='09123456789',
                                          budget=3000,
                                          m2=60,
                                          type='A',
                                          added_by=user,
                                          elevator=True,
                                          year=1399,
                                          parking=True,
                                          )
    return customer

@pytest.fixture(scope='function')
def rent_customer(db, user) -> RentCustomer:
    customer = RentCustomer.objects.create(customer_name='test',
                                          customer_phone='09123456789',
                                          up_budget=3000,
                                          rent_budget=6,
                                          m2=60,
                                          type='A',
                                          added_by=user,
                                          elevator=True,
                                          year=1399,
                                          parking=True,
                                          )
    return customer

@pytest.fixture(scope='function')
def buy_comment(db, buy_customer: BuyCustomer, user: User) -> BuyComment:
    comment = BuyComment.objects.create(file=buy_customer,
                                         user=user,
                                         body='test body',
                                         )
    return comment

@pytest.fixture(scope='function')
def rent_comment(db, rent_customer: RentCustomer, user: User) -> RentComment:
    comment = RentComment.objects.create(file=rent_customer,
                                         user=user,
                                         body='test body',
                                         )
    return comment
#!SECTION

##SECTION - Create
def test_create_BuyCustomer(user: User) -> None:
    #NOTE tests creation of a Buy customer
    customer = BuyCustomer.objects.create(customer_name='test',
                                          customer_phone='09123456789',
                                          budget=3000,
                                          m2=60,
                                          type='A',
                                          added_by=user,
                                          elevator=True,
                                          year=1399,
                                          parking=False
                                          )
    assert customer

def test_create_RentCustomer(user: User) -> None:
    #NOTE tests creation of a Rent customer
    customer = RentCustomer.objects.create(customer_name='test',
                                          customer_phone='09123456789',
                                          up_budget=3000,
                                          rent_budget=6,
                                          m2=60,
                                          type='A',
                                          added_by=user,
                                          elevator=True,
                                          year=1399,
                                          parking=False,
                                          )
    assert customer
    
def test_create_BuyComment(user: User, buy_customer: BuyCustomer) -> None:
    #NOTE test creation of BuyComment
    comment = BuyComment.objects.create(file=buy_customer,
                                         user=user,
                                         body='test body',
                                         )
    assert comment
    
def test_create_RentComment(user: User, rent_customer: RentCustomer) -> None:
    #NOTE tests creation of RentComment
    comment = RentComment.objects.create(file=rent_customer,
                                         user=user,
                                         body='test body',
                                         )
    assert comment
    
#SECTION - Update
def test_update_Buy(buy_customer: BuyCustomer) -> None:
    #NOTE - test for updating Buy customer
    buy_customer.customer_name = 'updated test'
    buy_customer.customer_phone = 'updated test'
    buy_customer.price = 4500
    buy_customer.bedroom = 3
    buy_customer.save()
    assert buy_customer.customer_name is 'updated test'
    assert buy_customer.price is 4500

def test_update_Rent(rent_customer: RentCustomer) -> None:
    #NOTE - test for updating Rent customer
    rent_customer.customer_name = 'updated test'
    rent_customer.customer_phone = 'updated test'
    rent_customer.price_up = 600
    rent_customer.price_rent = 4
    rent_customer.bedroom = 3
    rent_customer.save()
    assert rent_customer.customer_name is 'updated test'
    assert rent_customer.price_up is 600
    assert rent_customer.price_rent is 4

def test_update_BuyComment(buy_comment: BuyComment):
    buy_comment.body = 'updated test'
    buy_comment.save()
    assert buy_comment.body is 'updated test'
def test_update_BuyComment(rent_comment: RentComment):
    rent_comment.body = 'updated test'
    rent_comment.save()
    assert rent_comment.body is 'updated test'
#!SECTION

#SECTION - Read
def test_read_BuyCustomer(buy_customer: BuyCustomer, user: User) -> None:
    assert buy_customer.parking is True
    assert buy_customer.customer_name is 'test'
    assert buy_customer.added_by is user
    
def test_read_RentCustomer(rent_customer: RentCustomer, user: User) -> None:
    assert rent_customer.parking is True
    assert rent_customer.customer_name is 'test'
    assert rent_customer.added_by is user
    
def test_read_BuyComment(buy_comment: BuyComment, user: User) -> None:
    assert buy_comment.body is 'test body'
    assert buy_comment.user is user
    
def test_read_RentComment(rent_comment: RentComment, user: User) -> None:
    assert rent_comment.body is 'test body'
    assert rent_comment.user is user
#!SECTION

#SECTION - Delete
def test_delete_Buy(db, buy_customer: BuyCustomer) -> None:
    customer = BuyCustomer.objects.filter(customer_name='test')
    deleted = customer.delete()
    assert deleted
    
def test_delete_Rent(rent_customer: RentCustomer) -> None:
    customer = RentCustomer.objects.filter(customer_name='test')
    deleted = customer.delete()
    assert deleted
    
def test_delete_BuyComment(buy_comment: BuyComment) -> None:
    comment = BuyComment.objects.filter(body='test body')
    deleted = comment.delete()
    assert deleted
def test_delete_RentComment(rent_comment: RentComment) -> None:
    comment = RentComment.objects.filter(body='test body')
    deleted = comment.delete()
    assert deleted
#!SECTION

