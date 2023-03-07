from django import forms
from .models import Sell, Rent
class NewSellFile(forms.ModelForm):
    class Meta:
        model = Sell
        fields = "__all__"
class NewRentFile(forms.ModelForm):
    class Meta:
        model = Rent
        fields = "__all__"

