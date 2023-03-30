from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from . import forms
from django.contrib import messages
# Create your views here.

@csrf_exempt
def buy_customer(request):
    if request.method == 'POST':
        form = forms.BuyCustomerForm(request.POST)
        if form.is_valid():
            customer = form.save(commit=False)

            customer.save()
            messages.success(request, 'مشتری با موفقیت ثبت شد.',)
            return redirect('/')
        else:
            return HttpResponse('invalid request')
    else:
        form = forms.BuyCustomerForm()
        return render(request, 'customer/form.html', {'form': form})
    
@csrf_exempt
def rent_customer(request):
    if request.method == 'POST':
        form = forms.RentCustomerForm(request.POST)
        if form.is_valid():
            customer = form.save(commit=False)

            customer.save()           
            messages.success(request, 'مشتری با موفقیت ثبت شد.',)
            return render(request, 'customer/panel.html')
        else:
            return HttpResponse('invalid request')
    else:
        form = forms.RentCustomerForm()
        return render(request, 'customer/form.html', {'form': form})