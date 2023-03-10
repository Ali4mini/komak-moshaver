from django.shortcuts import render, get_object_or_404
from . import forms
from django.views.decorators.csrf import csrf_exempt
from .models import Sell, Rent
from django.http import HttpResponse
from django.contrib import messages
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
            
            return render(request, 'file/listing.html', {'files': files,
                                                         'filter_form': form,
                                                         })
    else:   
        form = forms.SellFilter()
        files = Sell.objects.all()
        return render(request, 'file/listing.html', {'files': files,
                                                     'filter_form': form
                                                     })


@csrf_exempt
def new_sell_file(request):
    if request.method == "POST":
        form = forms.NewSellFile(data=request.POST)
        if form.is_valid():
            # Create a NewSellFile object without saving it to the database
            comment = form.save(commit=False)

            print(request)
            # Save the comment to the database
            comment.save()
            
            messages.success(request, 'فایل با موفقیت ثبت شد.',)
            return render(request, 'file/panel.html', )
        return render(request, 'file/new_sell_file.html')

    else:
        form = forms.NewSellFile()
        return render(request, 'file/new_sell_file.html', )
    

@csrf_exempt
def new_rent_file(request):
    if request.method == "POST":
        form = forms.NewRentFile(data=request.POST)
        if form.is_valid():
            # Create a NewSellFile object without saving it to the database
            file = form.save(commit=False)

            print(request)
            # Save the comment to the database
            file.save()
            messages.success(request, 'فایل با موفقیت ثبت شد.',)
            return render(request, 'file/panel.html')
        else:
            print(request.POS)
            return render(request, 'file/new_rent_file.html')

    else:
        form = forms.NewRentFile()
        return render(request, 'file/new_rent_file.html', )
    

def file_detail(request, id):
    post = get_object_or_404(Sell, pk=id, )
    return render(request, 'file/file_detail.html', {'post': post})
