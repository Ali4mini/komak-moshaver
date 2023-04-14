from django.shortcuts import render
from . import forms
from file.models import Sell, Rent
from django.views import View
from django.http import HttpResponse
from .forms import SellFilter
from itertools import chain

# Create your views here.

class Panel(View):
    def post(self, request, *args, **kwargs):
        filter_form = forms.SellFilter(data=request.POST)
        if filter_form.is_valid():
            print(filter_form.cleaned_data)
            prop_type = filter_form.cleaned_data['property_type']
            m2 = filter_form.cleaned_data['m2']
            year = filter_form.cleaned_data['year']
            # making data ready for proccess
            if m2 == None:
                m2 = 0
            if year == None:
                year = 0
            if filter_form.cleaned_data['file_type'] == 'sell':
                budget = filter_form.cleaned_data['price']
                if budget == None:
                    budget = 999999999999
                files = Sell.objects.filter(price__lte=budget, 
                                            type=prop_type, 
                                            m2__gte=m2, 
                                            year__gte=year)
            elif filter_form.cleaned_data['file_type'] == 'rent':
                budget_up = filter_form.cleaned_data['price_up']
                budget_rent = filter_form.cleaned_data['price_rent']
                if budget_up == None:
                    budget_up = 999999999999
                if budget_rent == None:
                    budget_rent = 999999999999
                files = Rent.objects.filter(price_up__lte=budget_up,
                                            price_rent__lte=budget_rent, 
                                            type=prop_type, 
                                            m2__gte=m2,
                                            year__gte=year)
            return render(request, 'listing/listing_form.html',
                          {'files': files,
                            })
        return HttpResponse('form wasnt valid')
    def get(self, request, *args, **kwargs):  
 
        # form = forms.SellFilter()
        sell_files = Sell.objects.all()
        rent_files = Rent.objects.all()
        result_files = list(chain(sell_files, rent_files))
        return render(request, 'listing/listing_form.html', 
                      {'files': result_files,                       
                         })