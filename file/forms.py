from django import forms
from .models import Sell, Rent, Comment

class NewSellFile(forms.ModelForm): 
    class Meta:
        model = Sell
        fields = (
            'type',
            'price',
            'm2',
            'year',
            'owner_name',
            'owner_phone',
            'address',
            'floor',
            'elevator',
            'storage',
            'parking',
        )
        def __init__(self, *args, **kwargs):
            super(NewSellFile, self).__init__(*args, **kwargs)
            self.fields['pictures'].required = False

class NewRentFile(forms.ModelForm):
    
    class Meta:
        model = Rent
        fields = "__all__"
        
class CommentForm(forms.ModelForm):
    
    class Meta:
        model = Comment
        fields = ["body"]
    # def clean_field(self):
    #     data = self.data    
        
    #     return data
    
class UpdateForm(forms.ModelForm):
    class Meta:
        model = Sell
        fields = (
            'type',
            'price',
            'm2',
            'year',
            'owner_name',
            'owner_phone',
            'address',
            'floor',
            'elevator',
            'storage',
            'parking',
        )
        
    def __init__(self, *args, **kwargs) -> None:
        super(UpdateForm, self).__init__(*args, **kwargs)
        self.fields['type'].required = False
        self.fields['price'].required = False
        self.fields['m2'].required = False
        self.fields['year'].required = False
        self.fields['owner_name'].required = False
        self.fields['owner_phone'].required = False
        self.fields['address'].required = False
        self.fields['floor'].required = False
        self.fields['elevator'].required = False
        self.fields['storage'].required = False
        self.fields['parking'].required = False
        self.fields['pictures'].required = False
        


