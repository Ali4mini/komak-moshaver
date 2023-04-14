from django.shortcuts import render, redirect
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from . import forms
from django.contrib import messages
from django.views import View
from .models import BuyCustomer, RentCustomer
# Create your views here.

class Customer(View):
    def post(self, request, *args, **kwargs):
        data = request.POST
        print(data)
        if data['file_type'] == 'sell':
            customer, created = BuyCustomer.objects.get_or_create(customer_name=data['customer_name'],
                                                                    customer_phone=data['customer_phone'],
                                                                    type=data['property_type'],
                                                                    budget=data['budget'])
            if not created:
                messages.error(request, 'there is already a customer with this info in DB')
                return redirect('/')
            messages.success(request, 'مشتری با موفقیت ثبت شد.',)
            return redirect('/')
        elif data['file_type'] == 'rent':
            customer, created = RentCustomer.objects.get_or_create(customer_name=data['customer_name'],
                                                                    customer_phone=data['customer_phone'],
                                                                    type=data['property_type'],
                                                                    up_budget=data['budget_up'],
                                                                    rent_budget=data['budget_rent'])
            if not created:
                messages.error(request, 'there is already a customer with this info in DB')
                return redirect('/')
            messages.success(request, 'مشتری با موفقیت ثبت شد.',)
            return redirect('/')
    def get(self, request, *args, **kwargs):
        return render(request, 'customer/form.html')



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
        return render(request, 'customer/form.html')
    
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