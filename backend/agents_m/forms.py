from django import forms
from .models import Profile

class LoginForm(forms.Form):
    username = forms.CharField(max_length=100)
    password = forms.CharField(widget=forms.PasswordInput(attrs={'class':'password'}))
    
class ProfileForm(forms.ModelForm):
    class Meta:
        model = Profile
        fields = '__all__'
        

