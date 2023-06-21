import pytest
from django.contrib.auth.models import User
from file.models import Sell, Rent, SellComment, RentComment

#SECTION - fixtures
@pytest.fixture(scope='function')
def user(db) -> User:
    user = User.objects.create_user(username='test',
                                    email='test@test.com',
                                    password='test')
    return user


@pytest.fixture(scope='function')
def sell_file(db, user) -> Sell:
    file = Sell.objects.create(owner_name='test',
                               owner_phone='09123456789',
                               address='test',
                               m2=80,
                               price=3000,
                               year=1380,
                               floor=6,
                               elevator=True,
                               storage=True,
                               parking=False,
                               type='A',
                               added_by = user,
                               bedroom=2,
                               parking_motor=False,
                               takhlie='3',
                               vahedha=8,
                               komod_divari=True,
                               bazdid='test',
                               tabaghat=8,
                               )
    return file

@pytest.fixture(scope='function')
def rent_file(db, user) -> Rent:
    file = Rent.objects.create(owner_name='test',
                               owner_phone='09123456789',
                               address='test',
                               m2=80,
                               price_up=3000,
                               price_rent=3000,
                               year=1380,
                               floor=6,
                               elevator=True,
                               storage=True,
                               parking=False,
                               type='A',
                               added_by = user,
                               bedroom=2,
                               parking_motor=False,
                               takhlie='3',
                               vahedha=8,
                               komod_divari=True,
                               bazdid='test',
                               tabaghat=8,
                               tabdil=True,
                               )
    return file

@pytest.fixture(scope='function')
def sell_comment(db, sell_file: Sell, user: User) -> SellComment:
    comment = SellComment.objects.create(file=sell_file,
                                         user=user,
                                         body='test body',
                                         )
    return comment

@pytest.fixture(scope='function')
def rent_comment(db, rent_file: Rent, user: User) -> SellComment:
    comment = RentComment.objects.create(file=rent_file,
                                         user=user,
                                         body='test body',
                                         )
    return comment
#!SECTION

##SECTION - Create
def test_create_Sell(user: User) -> None:
    #NOTE tests creation of a Sell file
    file = Sell.objects.create(owner_name='test',
                               owner_phone='09123456789',
                               address='test',
                               m2=80,
                               price=3000,
                               year=1380,
                               floor=6,
                               elevator=True,
                               storage=True,
                               parking=False,
                               type='A',
                               added_by = user,
                               bedroom=2,
                               parking_motor=False,
                               takhlie='3',
                               vahedha=8,
                               komod_divari=True,
                               bazdid='test',
                               tabaghat=8,
                               )
    assert file

def test_create_Rent(user: User) -> None:
    #NOTE tests creation of a Rent file
    file = Rent.objects.create(owner_name='test',
                               owner_phone='09123456789',
                               address='test',
                               m2=80,
                               price_up=3000,
                               price_rent=3000,
                               year=1380,
                               floor=6,
                               elevator=True,
                               storage=True,
                               parking=False,
                               type='A',
                               added_by=user,
                               bedroom=2,
                               parking_motor=False,
                               takhlie='3',
                               vahedha=8,
                               komod_divari=True,
                               bazdid='test',
                               tabaghat=8,
                               tabdil=True,
                               )
    assert file
    
def test_create_SellComment(user: User, sell_file: Sell) -> None:
    #NOTE test creation of SellComment
    comment = SellComment.objects.create(file=sell_file,
                                         user=user,
                                         body='test body',
                                         )
    assert comment
    
def test_create_RentComment(user: User, rent_file: Rent) -> None:
    #NOTE tests creation of RentComment
    comment = RentComment.objects.create(file=rent_file,
                                         user=user,
                                         body='test body',
                                         )
    assert comment
    
#SECTION - Update
def test_update_Sell(sell_file: Sell) -> None:
    #NOTE - test for updating Sell file
    sell_file.owner_name = 'updated test'
    sell_file.owner_phone = 'updated test'
    sell_file.price = 4500
    sell_file.bedroom = 3
    sell_file.save()
    assert sell_file.owner_name is 'updated test'
    assert sell_file.price is 4500

def test_update_Rent(rent_file: Rent) -> None:
    #NOTE - test for updating Rent file
    rent_file.owner_name = 'updated test'
    rent_file.owner_phone = 'updated test'
    rent_file.price_up = 600
    rent_file.price_rent = 4
    rent_file.bedroom = 3
    rent_file.save()
    assert rent_file.owner_name is 'updated test'
    assert rent_file.price_up is 600
    assert rent_file.price_rent is 4

def test_update_SellComment(sell_comment: SellComment):
    sell_comment.body = 'updated test'
    sell_comment.save()
    assert sell_comment.body is 'updated test'
def test_update_SellComment(rent_comment: RentComment):
    rent_comment.body = 'updated test'
    rent_comment.save()
    assert rent_comment.body is 'updated test'
#!SECTION

#SECTION - Read
def test_read_Sell(sell_file: Sell, user: User) -> None:
    assert sell_file.address is 'test'
    assert sell_file.owner_name is 'test'
    assert sell_file.added_by is user
    
def test_read_Rent(rent_file: Rent, user: User) -> None:
    assert rent_file.address is 'test'
    assert rent_file.owner_name is 'test'
    assert rent_file.added_by is user
    
def test_read_SellComment(sell_comment: SellComment, user: User) -> None:
    assert sell_comment.body is 'test body'
    assert sell_comment.user is user
    
def test_read_RentComment(rent_comment: RentComment, user: User) -> None:
    assert rent_comment.body is 'test body'
    assert rent_comment.user is user
#!SECTION

#SECTION - Delete
def test_delete_Sell(db, sell_file: Sell) -> None:
    file = Sell.objects.filter(owner_name='test')
    deleted = file.delete()
    assert deleted
    
def test_delete_Rent(rent_file: Rent) -> None:
    file = Rent.objects.filter(owner_name='test')
    deleted = file.delete()
    assert deleted
    
def test_delete_SellComment(sell_comment: SellComment) -> None:
    comment = SellComment.objects.filter(body='test body')
    deleted = comment.delete()
    assert deleted
def test_delete_RentComment(rent_comment: RentComment) -> None:
    comment = RentComment.objects.filter(body='test body')
    deleted = comment.delete()
    assert deleted
#!SECTION

