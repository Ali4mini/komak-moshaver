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
        
class SellFilter(forms.ModelForm):
    class Meta:
        model = Sell
        fields = ['type', 'price', 'm2', 'year', 'parking']
        labels = {
            'type': ('آپارتمان'),
            'price': ('قیمت'),
            'm2': ('متراژ'),
            'year': ('سال ساخت'),
            'parking': ('پارکینگ'),

        }
        
    def __init__(self, *args, **kwargs) -> None:
        super(SellFilter, self).__init__(*args, **kwargs)
        self.fields['type'].required = False
        self.fields['price'].required = True
        self.fields['m2'].required = False
        self.fields['year'].required = False

