from django.shortcuts import render
from . import forms
from file.models import Sell, Rent
# Create your views here.

def panel(request):
    if request.method == 'POST':
        form = forms.SellFilter(data=request.POST)
        if form.is_valid():
            budget = form.cleaned_data['price']

            type = form.cleaned_data['type']
            if type == None:
                type = 0
            m2 = form.cleaned_data['m2']
            if m2 == None:
                m2 = 0
            year = form.cleaned_data['year']
            if year == None:
                year = 0
            parking = form.cleaned_data['parking']
            files = Sell.objects.filter(price__lte=budget, 
                                        type=type, 
                                        m2__gte=m2, 
                                        year__gte=year)
            
            return render(request, 'listing/listing.html', {'files': files,
                                                         'filter_form': form,
                                                         })
    else:   
        form = forms.SellFilter()
        files = Sell.objects.all()
        return render(request, 'listing/listing.html', {'files': files,
                                                     'filter_form': form
                                                     })