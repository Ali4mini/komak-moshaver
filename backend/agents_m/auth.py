from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.contrib.auth.views import LoginView, LogoutView
from .forms import LoginForm
from django.contrib import messages

class AgentLogin(View):
    def post(request, *args, **kwargs):
        login_form = LoginForm(request.POST)
        if login_form.is_valid():
            cd = login_form.cleaned_data
            user = authenticate(request, username=cd['username'], password=cd['password'])
            if user is not None:
                if user.is_active:
                    login(request, user)
                    messages.success(request, 'Authenticated successfully')
                    return HttpResponse('Authenticated successfully')
                else:
                    messages.error(request, 'Disabled account')
                    return HttpResponse('Disabled account')
            else:
                messages.error(request, 'invalid login')
                return HttpResponse('Invalid login')
        else:
            messages.error(request, 'form is not valid')
            return HttpResponse('from is not valid')      

    def get(request, *args, **kwargs):
        login_form = LoginForm()
        return render(request, 'registeration/login.html', {'form': login_form})
    
class GenericLoginView(LoginView):
    next_page = '/'

class GenericLogoutView(LogoutView):
    next_page = '/'
    
    