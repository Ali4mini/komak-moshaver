from django.shortcuts import render, get_object_or_404, redirect
from . import forms
from django.views.decorators.csrf import csrf_exempt
from .models import Sell, Rent
from django.contrib import messages
from django.urls import reverse_lazy
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.views.generic.edit import UpdateView, DeleteView
from django.views import View
from django.utils.decorators import method_decorator
# Create your views here.



@csrf_exempt
def new_sell_file(request):
    if request.method == "POST":
        form = forms.NewSellFile(data=request.POST)
        print(request.POST)
        if form.is_valid():
            # Create a NewSellFile object without saving it to the database
            file = form.save(commit=False)

            print(request)
            # Save the comment to the database
            file.save()
            # adding tags 
            form.save_m2m()

            messages.success(request, 'فایل با موفقیت ثبت شد.',)
            return redirect('/')
        
        messages.success(request, '!!!! ')
        return render(request, 'file/new_sell_file.html')

    else:
        form = forms.NewSellFile()
        return render(request, 'file/new_sell_file.html')
    

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
            return redirect('/')
        else:
            print(request.POS)
            return render(request, 'file/new_rent_file.html')

    else:
        form = forms.NewRentFile()
        return render(request, 'file/new_rent_file.html')
    
@method_decorator(login_required, name='dispatch')
class FileDetails(View):
    def post(self, request, id, *args, **kwargs):
        comment_form = forms.CommentForm(data=request.POST)
        file = get_object_or_404(Sell, pk=id)
        user = get_object_or_404(User, pk=request.user.id)
        if comment_form.is_valid():
            if request.user.is_authenticated:
                new_comment = comment_form.save(commit=False)
                new_comment.file = file
                new_comment.user = user
                new_comment.save()
                messages.success(request, 'all went ok ')
                return redirect(f'/file/sell/{id}')
            else:
                messages.error(request, 'login first')
                return redirect('/agents/login')
    def get(self, request, id, *args, **kwargs):
        file = get_object_or_404(Sell, pk=id, )
        comment_form = forms.CommentForm()
        comments = file.comments.all()
        return render(request, 'file/file_detail.html', {'file': file,
                                                         'comments': comments,
                                                         'comment_form': comment_form,
                                                         })

@method_decorator(csrf_exempt, name='dispatch')
class FileDelete(View):
    def post(self,request,pk, *args, **kwargs):
        try:
            file = Sell.objects.get(pk=pk)
            file.delete()
            messages.success(request, 'all done')
        except:
            messages.error(request, 'something went wrong!')
        return redirect('/')     
        

# class SellDeleteView(DeleteView):
#     model = Sell
#     success_url = reverse_lazy('listing:list')

    
class SellUpdateView(UpdateView):
    model = Sell
    template_name = 'file/sell_update.html'
    success_url = '/'
    # fields = (
    #     'type',
    #     'price',
    #     'm2',
    #     'year',
    #     'owner_name',
    #     'owner_phone',
    #     'address',
    #     'floor',
    #     'elevator',
    #     'storage',
    #     'parking',
    #     'pictures',
    #     )    
    form_class = forms.UpdateForm

    def get(self, request, pk, *args, **kwargs):
        file = self.model.objects.get(pk=pk)
        print(file)
        return render(request, 'file/sell_update.html' , {'file': file})
        
        
        
    








