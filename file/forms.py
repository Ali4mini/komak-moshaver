from django import forms
from .models import Sell, Rent, Comment
class NewSellFile(forms.ModelForm):
    
    class Meta:
        model = Sell
        fields = "__all__"
        
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
    
        


