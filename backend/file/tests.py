# tests.py
from django.test import TestCase
from django.contrib.auth.models import User
from .models import Rent
from customer.models import RentCustomer

class RentModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(username='testuser', password='12345')
        self.rent_customer = RentCustomer.objects.create(customer_name='Test Customer', up_budget=1000, rent_budget=500)
        self.rent = Rent.objects.create(
            owner_name='Test Owner',
            owner_phone='1234567890',
            address='Test Address',
            price_up=1000,
            price_rent=500,
            property_type=Rent.Types.APARTEMANT,
            added_by=self.user,
            parking=True,
            parking_motor=False,
            status=Rent.Status.ACTIVE,
        )

    def test_rent_creation(self):
        """Test the creation of a Rent instance."""
        self.assertIsInstance(self.rent, Rent)
        self.assertEqual(self.rent.__str__(), f"code: {self.rent.id} owner: Test Owner ")

    def test_get_related_customers(self):
        """Test the get_related_customers method."""
        related_customers = self.rent.get_related_customers()
        self.assertIn(self.rent_customer, related_customers)

    def test_rent_model_fields(self):
        """Test the fields of the Rent model."""
        self.assertEqual(self.rent.owner_name, 'Test Owner')
        self.assertEqual(self.rent.owner_phone, '1234567890')
        self.assertEqual(self.rent.address, 'Test Address')
        self.assertEqual(self.rent.price_up, 1000)
        self.assertEqual(self.rent.price_rent, 500)
        self.assertEqual(self.rent.property_type, Rent.Types.APARTEMANT)
        self.assertEqual(self.rent.added_by, self.user)
        self.assertTrue(self.rent.parking)
        self.assertFalse(self.rent.parking_motor)
        self.assertEqual(self.rent.status, Rent.Status.ACTIVE)

    def test_rent_model_methods(self):
        """Test the methods of the Rent model."""
        self.assertEqual(self.rent.get_pk(), self.rent.pk)
        self.assertEqual(self.rent.get_absolute_url(), '/file/rent/1/') # Assuming the URL pattern is correct
