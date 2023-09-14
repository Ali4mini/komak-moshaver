from django.test import TestCase
from django.contrib.auth.models import User
from agents_m.models import Profile

class ProfileModelTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            username='testuser',
            password='testpassword'
        )
        self.profile = Profile.objects.create(
            user=self.user,
            first_name='John',
            last_name='Doe',
            phone_number='1234567890',
            field=Profile.Fields.SELL
        )

    def test_profile_str(self):
        """Test the __str__ method of the Profile model."""
        expected_str = 'John with username: testuser'
        self.assertEqual(str(self.profile), expected_str)

    def test_profile_field_choices(self):
        """Test the available choices for the 'field' field."""
        self.assertTrue(Profile.Fields.SELL in [choice[0] for choice in Profile.Fields.choices])
        self.assertTrue(Profile.Fields.RENT in [choice[0] for choice in Profile.Fields.choices])

    def test_profile_default_field(self):
        """Test that the default value for 'field' is set correctly."""
        self.assertEqual(self.profile.field, Profile.Fields.SELL)

    # Add more test methods as needed

