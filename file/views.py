from django.shortcuts import render, get_object_or_404, redirect
from . import forms
from django.views.decorators.csrf import csrf_exempt
from .models import Sell, Rent, SellImages
from django.contrib import messages
from django.urls import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.generic.edit import UpdateView, DeleteView
from django.views import View
from django.utils.decorators import method_decorator
import requests
# Create your views here.


class NewFile(View):
    def post(self, request, *args, **kwargs):
        data = request.POST
        data = data.copy()
        file_type = data['file_type']
        ## temp for images
        data['image1'] = ''
        data['image2'] = ''
        data['image3'] = ''
        data['image4'] = ''
        data['image5'] = ''
        
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
        try:
            data['parking_motor']
            data['parking_motor'] = True
        except:
            data['parking_motor'] = False
        try:
            data['komod_divari']
            data['komod_divari'] = True
        except:
            data['komod_divari'] = False
        print(data)
        if file_type == 'sell':
            # try:
                file, created = Sell.objects.get_or_create(type=data['property_type'],
                                                            owner_name=data['owner_name'],
                                                            owner_phone=data['owner_phone'],
                                                            address=data['address'],
                                                            m2=data['m2'],
                                                            price=data['price'],
                                                            year=data['year'],
                                                            floor=data['floor'],
                                                            elevator=data['elevator'],
                                                            storage=data['storage'],
                                                            parking=data['parking'],
                                                            added_by=request.user,
                                                            image1=data['image1'],
                                                            image2=data['image2'],
                                                            image3=data['image3'],
                                                            image4=data['image4'],
                                                            image5=data['image5'],
                                                            bedroom=data['bedroom'],
                                                            parking_motor=data['parking_motor'],
                                                            takhlie=data['takhlie'],
                                                            bazdid=data['bazdid'],
                                                            vahedha=data['vahedha'],
                                                            komod_divari=data['komod_divari'],
                                                            tabaghat=data['tabaghat'])
                if not created:
                    messages.error(request, 'there is a file with this info in site. ')
                    return redirect('/')
            
                messages.success(request, 'فایل با موفقیت ثبت شد.',)
                return redirect('/')
            # except:
            #     messages.success(request, 'فایل   ',)
            #     return redirect('/')

        if file_type == 'rent':
            file, created = Rent.objects.get_or_create(type=data['property_type'],
                                        owner_name=data['owner_name'],
                                        owner_phone=data['owner_phone'],
                                        address=data['address'],
                                        m2=data['m2'],
                                        price_up=data['price_up'],
                                        price_rent=data['price_rent'],
                                        year=data['year'],
                                        floor=data['floor'],
                                        elevator=data['elevator'],
                                        storage=data['storage'],
                                        parking=data['parking'],
                                        added_by=request.user,
                                        image1=data['image1'],
                                        image2=data['image2'],
                                        image3=data['image3'],
                                        image4=data['image4'],
                                        image5=data['image5'],
                                        bedroom=data['bedroom'],
                                        parking_motor=data['parking_motor'],
                                        takhlie=data['takhlie'],
                                        bazdid=data['bazdid'],
                                        vahedha=data['vahedha'],
                                        komod_divari=data['komod_divari'],
                                        tabaghat=data['tabaghat'])
            if not created:
                messages.error(request, 'there is a file with this info in site. ')
                return redirect('/')
            messages.success(request, 'فایل با موفقیت ثبت شد.',)
            return redirect('/')

    def get(self, request, *args, **kwargs):
        form = forms.NewSellFile()
        return render(request, 'file/new_file.html')

# @csrf_exempt
# def new_rent_file(request):
#     if request.method == "POST":
#         form = forms.NewRentFile(data=request.POST)
#         if form.is_valid():
#             # Create a NewSellFile object without saving it to the database
#             file = form.save(commit=False)

#             print(request)
#             # Save the comment to the database
#             file.save()
#             messages.success(request, 'فایل با موفقیت ثبت شد.',)
#             return redirect('/')
#         else:
#             print(request.POS)
#             return render(request, 'file/new_rent_file.html')

#     else:
#         form = forms.NewRentFile()
#         return render(request, 'file/new_rent_file.html')
    
@method_decorator((login_required, csrf_exempt), name='dispatch')
class SellFileDetails(View):
    def post(self, request, pk, *args, **kwargs):
        comment_form = forms.SellCommentForm(data=request.POST)
        file = get_object_or_404(Sell, pk=pk)
        user = get_object_or_404(User, pk=request.user.id)
        if comment_form.is_valid():
            if request.user.is_authenticated:
                new_comment = comment_form.save(commit=False)
                new_comment.file = file
                new_comment.user = user
                new_comment.save()
                messages.success(request, 'all went ok ')
                return redirect(f'/file/sell/{pk}')
            else:
                messages.error(request, 'login first')
                return redirect('/agents/login')
    def get(self, request, pk, *args, **kwargs):
        file = get_object_or_404(Sell, pk=pk, )
        comment_form = forms.SellCommentForm()
        comments = file.sell_comments.all()
        image_fields = [file.image1,
                        file.image2,
                        file.image3,
                        file.image4,
                        file.image5,
                        ]
        def image_field_validator(field):
            try:
                return field.url
            except:
                return None
        
        images = [image_field_validator(image) for image in image_fields if image_field_validator(image) != None]

        return render(request, 'file/file_detail.html', {'file': file,
                                                         'comments': comments,
                                                         'comment_form': comment_form,
                                                         'send_form': forms.SendInfo(),
                                                         'images': images,
                                                         'file_type': 'sell',
                                                         })

    
@method_decorator((login_required, csrf_exempt), name='dispatch')
class RentFileDetails(View):
    def post(self, request, pk, *args, **kwargs):
        comment_form = forms.RentCommentForm(data=request.POST)
        file = get_object_or_404(Rent, pk=pk)
        user = get_object_or_404(User, pk=request.user.id)
        if comment_form.is_valid():
            if request.user.is_authenticated:
                new_comment = comment_form.save(commit=False)
                new_comment.file = file
                new_comment.user = user
                new_comment.save()
                messages.success(request, 'all went ok ')
                return redirect(f'/file/rent/{pk}')
            else:
                messages.error(request, 'login first')
                return redirect('/agents/login')
    def get(self, request, pk, *args, **kwargs):
        file = get_object_or_404(Rent, pk=pk, )
        comment_form = forms.RentCommentForm()
        comments = file.rent_comments.all()
        image_fields = [file.image1,
                        file.image2,
                        file.image3,
                        file.image4,
                        file.image5,
                        ]
        def image_field_validator(field):
            try:
                return field.url
            except:
                return None
        
        images = [image_field_validator(image) for image in image_fields if image_field_validator(image) != None]

        return render(request, 'file/file_detail.html', {'file': file,
                                                         'comments': comments,
                                                         'comment_form': comment_form,
                                                         'send_form': forms.SendInfo(),
                                                         'images': images,
                                                         'file_type': 'rent',

                                                         })

@method_decorator(csrf_exempt, name='dispatch')
class SellFileDelete(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            file = Sell.objects.get(pk=pk)
            file.delete()
            messages.success(request, 'all done')
        except:
            messages.error(request, 'something went wrong!')
        return redirect('/listing/')     

class RentFileDelete(View):
    def post(self, request, pk, *args, **kwargs):
        try:
            file = Rent.objects.get(pk=pk)
            file.delete()
            messages.success(request, 'all done')
        except:
            messages.error(request, 'something went wrong!')
        return redirect('/listing/')     
         

# class SellDeleteView(DeleteView):
#     model = Sell
#     success_url = reverse_lazy('listing:list')

    
class SellUpdateView(UpdateView):
    model = Sell
    # template_name = 'file/sell_update.html'
    success_url = '/listing/'
    form_class = forms.SellUpdateForm

    def get(self, request, pk, *args, **kwargs):
        file = self.model.objects.get(pk=pk)
        print(file)
        return render(request, 'file/sell_update.html' , {'file': file})
    
class RentUpdateView(UpdateView):
    model = Rent
    # template_name = 'file/rent_update.html'
    success_url = '/listing/'
    form_class = forms.RentUpdateForm
    

    def get(self, request, pk, *args, **kwargs):
        file = self.model.objects.get(pk=pk)
        print(file)
        return render(request, 'file/rent_update.html' , {'file': file})
        
        
class SellSendInfo(View):
    def post(self, request, pk, *args, **kwargs):
        phone_number = request.POST.get('phone')
        file = Sell.objects.get(pk=pk)
        ## making info ready to send
        if file.elevator:
            elevator = 'دارد'
        else:
            elevator = 'ندارد'
        if file.storage:
            storage = 'دارد'
        else:
            storage = 'ندارد'
        if file.parking:
            parking = 'دارد'
        else:
            parking = 'ندارد'
            
        sell_template = f'''
        آدرس : {file.address}
        متراژ: {file.m2}
        قیمت: {file.price}
        طبقه: {file.floor}
        آسانسور: {elevator}
        پارکینگ: {parking}
        انباری: {storage}
        '''
    
        data = {'from':'50004001845778', 'to':[phone_number], 'text':sell_template, 'udh':''}
        response = requests.post('https://console.melipayamak.com/api/send/advanced/b59dd6ca1de047aabf4416be63da2c01', json=data)
        
        print(response.json())
        messages.success(request, 'all done')
        return redirect('/')








