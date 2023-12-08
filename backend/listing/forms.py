from django import forms
from file.models import Sell, Rent


class SellFilter(forms.ModelForm):
    price_up = forms.IntegerField(required=False)
    price_rent = forms.IntegerField(required=False)
    property_type = forms.CharField(max_length=10, required=True)
    file_type = forms.CharField(max_length=10, required=True)

    class Meta:
        model = Sell
        fields = ['price', 'm2', 'year', 'parking']
        labels = {
            'price': ('قیمت'),
            'm2': ('متراژ'),
            'year': ('سال ساخت'),
            'parking': ('پارکینگ'),

        }
        
    def __init__(self, *args, **kwargs) -> None:
        super(SellFilter, self).__init__(*args, **kwargs)
        self.fields['price'].required = False
        self.fields['price_up'].required = False
        self.fields['price_rent'].required = False
        self.fields['m2'].required = False
        self.fields['year'].required = False
        # adding classes to tags
        self.fields['price'].widget.attrs['class'] = 'input'
        self.fields['m2'].widget.attrs['class'] = 'input'
        self.fields['year'].widget.attrs['class'] = 'input'
        self.fields['parking'].widget.attrs['class'] = 'checkbox'

