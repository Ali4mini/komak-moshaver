from django.db import models

class Person(models.Model):
    """
    base model for Persons information in CRM system.
    """
    class GenderChoices(models.TextChoices):
        APARTEMANT = "F", "خانم"
        VILA = "M", "آقا"

    # Personal Information
    first_name = models.CharField('first name', max_length=100, null=True)
    last_name = models.CharField('last name', max_length=100, null=True)
    date_of_birth = models.DateField('date of birth', blank=True, null=True)
    gender = models.CharField('gender', max_length=1, choices=GenderChoices.choices, blank=True, null=True)
    
    # Contact Information
    phone_number = models.CharField('phone number',unique=True, max_length=17, blank=False, null=False)
    address = models.TextField('address', blank=True, null=True)
    
    # CRM Specific Fields
    last_contact = models.DateTimeField('last contact', blank=True, null=True)
    notes = models.TextField('notes', blank=True, null=True)
    
    
    # Metadata
    created_at = models.DateTimeField('created at', auto_now_add=True)
    updated_at = models.DateTimeField('updated at', auto_now=True)
    
    class Meta:
        ordering = ['last_name', 'first_name']
        verbose_name = 'Person'
        verbose_name_plural = 'Person'
    
    def __str__(self):
        return self.get_full_name()
    
    def get_full_name(self):
        """Return the full name of the customer."""
        return f"{self.first_name} {self.last_name}"
    
