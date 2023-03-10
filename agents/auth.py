from django.http import HttpResponse
from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login
from django.views.decorators.csrf import csrf_exempt
from .forms import LoginForm
from django.contrib import messages

@csrf_exempt
def agent_login(request):
    if request.method == 'POST':
        form = LoginForm(request.POST)
        if form.is_valid():
            cd = form.cleaned_data
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
            

    else:
        form = LoginForm()
        return render(request, 'file/form.html', {'form': form})
    
