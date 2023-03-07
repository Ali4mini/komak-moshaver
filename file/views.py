from django.shortcuts import render, get_object_or_404
from . import forms
from django.views.decorators.csrf import csrf_exempt
from django.http import Http404
from .models import Sell, Rent
# Create your views here.


def panel(request):
    return render(request, 'file/panel.html')


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
            return render(request, 'file/panel.html')
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
            return render(request, 'file/panel.html')
        else:
            print(request.POS)
            return render(request, 'file/new_rent_file.html')

    else:
        form = forms.NewRentFile()
        return render(request, 'file/new_rent_file.html', )
    

def sell_post_detail(request, id):
    post = get_object_or_404(Sell, pk=id, )
    return render(request, 'file/file_detail.html', {'post': post})
