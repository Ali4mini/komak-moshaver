from django.shortcuts import render
from . import forms
from file.models import Sell, Rent
from customer.models import BuyCustomer, RentCustomer
from django.views import View
from django.http import HttpResponse
from .forms import SellFilter
from itertools import chain
from django.contrib.auth.decorators import login_required
from django.utils.decorators import method_decorator

# Create your views here.
@method_decorator((login_required), name='dispatch')
class Panel(View):
    def post(self, request, *args, **kwargs):
        data = request.POST.copy()
        property_type = data['property_type']
        m2 = data['m2']
        year = data['year']
        bedroom = data['bedroom']
        # making data ready for proccess
        if data['m2'] == '':
            m2 = 0
        if data['year'] == '':
            year = 0
        if data['bedroom'] == '':
            bedroom = 0

        if data['file_type'] == 'sell':
            budget = data['price']
            if budget == '':
                budget = 999999999999
            files = Sell.objects.filter(price__lte=budget, 
                                        type=property_type, 
                                        m2__gte=m2, 
                                        year__gte=year).exclude(owner_name='UNKNOWN')
        elif data['file_type'] == 'rent':
            budget_up = data['up_price']
            budget_rent = data['rent_price']
            if budget_up == '':
                budget_up = 999999999999
            if budget_rent == '':
                budget_rent = 999999999999
            files = Rent.objects.filter(price_up__lte=budget_up,
                                        price_rent__lte=budget_rent, 
                                        type=property_type, 
                                        m2__gte=m2,
                                        year__gte=year).exclude(owner_name='UNKNOWN')
            
        try:
            if data['parking'] == 'on':
                files = files.filter(parking=True).all()
        except:
            pass
        
        try:    
            if data['elevator'] == 'on':
                files = files.filter(elevator=True).all()
        except:
            pass
        
        try:  
            if data['storage'] == 'on':
                files = files.filter(storage=True).all()
        except:
            pass
            
        return render(request, 'index.html',
                        {'files': files,})
        
    def get(self, request, *args, **kwargs):  
        sell_files = Sell.objects.exclude(owner_name='UNKNOWN')
        rent_files = Rent.objects.exclude(owner_name='UNKNOWN')
        result_files = list(chain(sell_files, rent_files))
        return render(request, 'index.html', 
                      {'files': result_files,                       
                         })

@method_decorator((login_required), name='dispatch')
class Listing(View):
    def get(self, request, *args, **kwargs):
        sell_files = Sell.objects.filter(tag_manager__name__in=['دیوار'], owner_name='UNKNOWN')
        rent_files = Rent.objects.filter(tags_manager__name__in=['دیوار'], owner_name='UNKNOWN')
        result_files = list(chain(sell_files, rent_files))
        return render(request, 'listing/listing.html', 
                      {'files': result_files,                       
                         })
        
class Customer(View):
    def post(self, request, *args, **kwargs):
        data = request.POST.copy()
        print(data)
        
        if data['m2'] == '':
            data['m2'] = 0
        if data['year'] == '':
            data['year'] = 0
        
        if data['customer_type'] == 'buy':
            if data['budget'] == '':
                data['budget'] = 999999999999 #* we need a big number to budget filter work's fine
            customers = BuyCustomer.objects.filter(budget__lte=data['budget'],
                                                    m2__gte=data['m2'],
                                                    year__gte=data['year'],
                                                    type=data['property_type']).all()

        elif data['customer_type'] == 'rent':
            if data['up_budget'] == '':
                data['up_budget'] = 999999999999
            if data['rent_budget'] == '':
                data['rent_budget'] = 999999999999
                
            customers = RentCustomer.objects.filter(up_budget__lte=data['budget'],
                                                    rent_budget__lte=data['budget'],
                                                    m2__gte=data['m2'],
                                                    year__gte=data['year'],
                                                    type=data['property_type']).all()
        
        try:
            if data['parking'] == 'on':
                customers = customers.filter(parking=True).all()
        except:
            pass
        
        try:    
            if data['elevator'] == 'on':
                customers = customers.filter(elevator=True).all()
        except:
            pass
        
        try:  
            if data['storage'] == 'on':
                customers = customers.filter(storage=True).all()
        except:
            pass
        
        return render(request, 'customer/customers.html', {'customers': customers})
    
    def get(self, request, *args, **kwargs):
        buy_customers = BuyCustomer.objects.all()
        rent_customer = RentCustomer.objects.all()
        result_customers = list(chain(buy_customers, rent_customer))
        return render(request, 'customer/customers.html', {'customers': result_customers})
    
class FilePKFilter(View):
    def get(self, request, *args, **kwargs):
        data = request.GET.copy()
        if data['file_type'] == 'sell':
            file = Sell.objects.get(pk=data['pk'])
        elif data['file_type'] == 'rent':
            file = Rent.objects.get(pk=data['pk'])
        return render(request, 'index.html', {'files': [file]})