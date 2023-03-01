from django import forms
from . import models
class NewSellFile(forms.ModelForm):
    class Meta:
        model = models.Sell
        fields = "__all__"
class NewRentFile(forms.ModelForm):
    class Meta:
        model = models.Rent
        fields = "__all__"