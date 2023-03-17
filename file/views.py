from django.shortcuts import render, get_object_or_404, redirect
from . import forms
from django.views.decorators.csrf import csrf_exempt
from .models import Sell, Rent
from django.contrib import messages
from django.urls import reverse
# Create your views here.



@csrf_exempt
def new_sell_file(request):
    if request.method == "POST":
        form = forms.NewSellFile(data=request.POST)
        if form.is_valid():
            # Create a NewSellFile object without saving it to the database
            file = form.save(commit=False)

            print(request)
            # Save the comment to the database
            file.save()
            # adding tags 
            form.save_m2m()

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
    file = get_object_or_404(Sell, pk=id, )
    return render(request, 'file/file_detail.html', {'post': file})

def file_delete(request, id):
    file = Sell.objects.get(pk=id)
    file.delete()
    messages.success(request,'فایل ما موفقیت حذف شد.')
    return redirect('/')










