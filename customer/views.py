from django.shortcuts import render, redirect, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.http import HttpResponse
from . import forms
from django.contrib import messages
from django.views import View
from .models import BuyCustomer, RentCustomer
from itertools import chain
from django.utils.decorators import method_decorator
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.generic.edit import UpdateView, DeleteView


# Create your views here.

class NewCustomer(View):
    def post(self, request, *args, **kwargs):
        data = request.POST.copy()
        
        try:
            data['elevator']
            data['elevator'] = True
        except:
            data['elevator'] = False
        try:
            data['storage']
            data['storage'] = True
        except:
            data['storage'] = False
        try:
            data['parking']
            data['parking'] = True
        except:
            data['parking'] = False
             
        if data['file_type'] == 'buy':
            customer, created = BuyCustomer.objects.get_or_create(customer_name=data['customer_name'],
                                                                    customer_phone=data['customer_phone'],
                                                                    type=data['property_type'],
                                                                    budget=data['budget'],
                                                                    m2=data['m2'],
                                                                    year=data['year'],
                                                                    elevator=data['elevator'],
                                                                    parking=data['parking'],
                                                                    storage=data['storage'],
                                                                    added_by=request.user)
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
                                                                    rent_budget=data['budget_rent'],
                                                                    m2=data['m2'],
                                                                    year=data['year'],
                                                                    elevator=data['elevator'],
                                                                    parking=data['parking'],
                                                                    storage=data['storage'],
                                                                    added_by=request.user)
            if not created:
                messages.error(request, 'there is already a customer with this info in DB')
                return redirect('customer/')
            messages.success(request, 'مشتری با موفقیت ثبت شد.',)
            return redirect('customer/')
    def get(self, request, *args, **kwargs):
        return render(request, 'customer/form.html')

class CustomerListing(View):
    def get(self, request, *args, **kwargs):
        buy_customers = BuyCustomer.objects.all()
        rent_customer = RentCustomer.objects.all()
        result_customers = list(chain(buy_customers, rent_customer))
        return render(request, 'customer/listing.html', {'customers': result_customers})
    
    

@method_decorator((login_required, csrf_exempt), name='dispatch')
class BuyCustomerDetails(View):
    def post(self, request, pk, *args, **kwargs):
        comment_form = forms.CommentForm(data=request.POST)
        file = get_object_or_404(BuyCustomer, pk=pk)
        user = get_object_or_404(User, pk=request.user.id)
        if comment_form.is_valid():
            if request.user.is_authenticated:
                new_comment = comment_form.save(commit=False)
                new_comment.file = file
                new_comment.user = user
                new_comment.save()
                messages.success(request, 'all went ok ')
                return redirect(f'/customer/buy/{pk}')
            else:
                messages.error(request, 'login first')
                return redirect('/agents/login')
    def get(self, request, pk, *args, **kwargs):
        customer = get_object_or_404(BuyCustomer, pk=pk, )
        comment_form = forms.CommentForm()
        comments = customer.buy_customer_comments.all()
        return render(request, 'customer/detail.html', {'customer': customer,
                                                         'comments': comments,
                                                         'comment_form': comment_form,
                                                         'customer_type': 'buy',
                                                         })
        
@method_decorator((login_required, csrf_exempt), name='dispatch')
class RentCustomerDetails(View):
    def post(self, request, pk, *args, **kwargs):
        comment_form = forms.CommentForm(data=request.POST)
        file = get_object_or_404(RentCustomer, pk=pk)
        user = get_object_or_404(User, pk=request.user.id)
        if comment_form.is_valid():
            if request.user.is_authenticated:
                new_comment = comment_form.save(commit=False)
                new_comment.file = file
                new_comment.user = user
                new_comment.save()
                messages.success(request, 'all went ok ')
                return redirect(f'/customer/rent/{pk}')
            else:
                messages.error(request, 'login first')
                return redirect('/agents/login')
    def get(self, request, pk, *args, **kwargs):
        customer = get_object_or_404(RentCustomer, pk=pk, )
        comment_form = forms.CommentForm()
        comments = customer.rent_customer_comments.all()
        print(customer.type)
        return render(request, 'customer/detail.html', {'customer': customer,
                                                         'comments': comments,
                                                         'comment_form': comment_form,
                                                         'customer_type': 'rent',
                                                         })
        
class BuyCustomerDelete(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            file = BuyCustomer.objects.get(pk=pk)
            file.delete()
            messages.success(request, 'all done')
        except:
            messages.error(request, 'something went wrong!')
        return redirect('/customer/')     

class RentCustomerDelete(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            file = RentCustomer.objects.get(pk=pk)
            file.delete()
            messages.success(request, 'all done')
        except:
            messages.error(request, 'something went wrong!')
        return redirect('/customer/')     
    
class BuyUpdateView(UpdateView):
    model = BuyCustomer
    template_name = 'customer/sell_update_form.html'
    success_url = 'customer/'
    form_class = forms.SellUpdateForm

    def get(self, request, pk, *args, **kwargs):
        customer = self.model.objects.get(pk=pk)
        return render(request, 'customer/sell_update_form.html' , {'customer': customer})
    
class RentUpdateView(UpdateView):
    model = RentCustomer
    template_name = 'customer/rent_update_form.html'
    success_url = 'customer/'
    form_class = forms.RentUpdateForm

    def get(self, request, pk, *args, **kwargs):
        customer = self.model.objects.get(pk=pk)
        return render(request, 'customer/rent_update_form.html' , {'customer': customer})
