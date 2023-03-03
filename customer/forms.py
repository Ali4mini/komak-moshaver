from django import forms
from . import models

class BuyCustomerForm(forms.ModelForm):
    class Meta:
        model = models.BuyCustomer
        fields = '__all__'

class RentCustomerForm(forms.ModelForm):
    class Meta:
        model = models.RentCustomer
        fields = '__all__'
