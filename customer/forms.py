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
class CommentForm(forms.ModelForm):
    
    class Meta:
        model = models.BuyComment
        fields = ["body"]
    # def clean_field(self):
    #     data = self.data    
        
    #     return data
    
class SellUpdateForm(forms.ModelForm):
    class Meta:
        model = models.BuyCustomer
        fields = (
            'type',
            'budget',
            'm2',
            'year',
            'customer_name',
            'customer_phone',
            'elevator',
            'storage',
            'parking',
        )
        
    def __init__(self, *args, **kwargs) -> None:
        super(SellUpdateForm, self).__init__(*args, **kwargs)
        self.fields['type'].required = False
        self.fields['budget'].required = False
        self.fields['m2'].required = False
        self.fields['year'].required = False
        self.fields['customer_name'].required = False
        self.fields['customer_phone'].required = False
        self.fields['elevator'].required = False
        self.fields['storage'].required = False
        self.fields['parking'].required = False
        
class RentUpdateForm(forms.ModelForm):
    class Meta:
        model = models.RentCustomer 
        fields = (
            'type',
            'up_budget',
            'rent_budget',
            'm2',
            'year',
            'customer_name',
            'customer_phone',
            'elevator',
            'storage',
            'parking',
        )
        
    def __init__(self, *args, **kwargs) -> None:
        super(RentUpdateForm, self).__init__(*args, **kwargs)
        self.fields['type'].required = False
        self.fields['up_budget'].required = False
        self.fields['rent_budget'].required = False
        self.fields['m2'].required = False
        self.fields['year'].required = False
        self.fields['customer_name'].required = False
        self.fields['customer_phone'].required = False
        self.fields['elevator'].required = False
        self.fields['storage'].required = False
        self.fields['parking'].required = False
 