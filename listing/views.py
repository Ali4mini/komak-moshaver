from django.shortcuts import render
from . import forms
from file.models import Sell, Rent
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
        filter_form = forms.SellFilter(data=request.POST)
        if filter_form.is_valid():
            print(filter_form.cleaned_data)
            prop_type = filter_form.cleaned_data['property_type']
            m2 = filter_form.cleaned_data['m2']
            print(m2)
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
                                            year__gte=year).exclude(owner_name='UNKNOWN')
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
                                            year__gte=year).exclude(owner_name='UNKNOWN')
            return render(request, 'index.html',
                          {'files': files,
                            })
        return HttpResponse('form wasnt valid')
    def get(self, request, *args, **kwargs):  
 
        # form = forms.SellFilter()
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