from django import forms
from file.models import Sell, Rent


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
        # adding classes to tags
        self.fields['type'].widget.attrs['class'] = 'input'
        self.fields['price'].widget.attrs['class'] = 'input'
        self.fields['m2'].widget.attrs['class'] = 'input'
        self.fields['year'].widget.attrs['class'] = 'input'
        self.fields['parking'].widget.attrs['class'] = 'checkbox'