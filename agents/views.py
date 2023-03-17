from django.shortcuts import render, redirect
from django.contrib import messages
from django.views import View
from django.contrib.auth.decorators import login_required
from .forms import ProfileForm
# Create your views here.

# class Profile(View):
#     def get(self, request, **args, **kwargs):
        
        

@login_required()
def profile(request):
    if request.method == 'POST':
        profile_form = ProfileForm(data=request.POST)
        if profile_form.is_valid():
            profile_form.save(commit=True)
            messages.success(request, "all good ")
            return redirect('/')
        else:
            messages.error(request,'went wrongly  ')
            return redirect('/agents/login')
    if request.method == 'GET':
        profile_form = ProfileForm()
        return render(request, 'agents/form.html', {'profile_form': profile_form})
        
        
        

            
