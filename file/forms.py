# from django import forms
# from .models import Sell, Rent, SellComment,RentComment, SellImages, RentImages

# class NewSellFile(forms.ModelForm): 
#     file_type = forms.CharField(required=True)  
#     price_up = forms.IntegerField(required=False)
#     price_rent = forms.IntegerField(required=False)

#     class Meta:
#         model = Sell
#         fields = (
#             'type',
#             'price',
#             'm2',
#             'year',
#             'owner_name',
#             'owner_phone',
#             'address',
#             'floor',
#             'elevator',
#             'storage',
#             'parking',
#             'image1',
#             'image2',
#             'image3',
#             'image4',
#             'image5',
#         )
#         def __init__(self, *args, **kwargs):
#             super(NewSellFile, self).__init__(*args, **kwargs)
#             self.fields['price'].required = False
#             self.fields['price_up'].required = False
#             self.fields['price_rent'].required = False
#             self.fields['m2'].required = False
#             self.fields['year'].required = False
# # class NewFile(forms.ModelForm):
# #     price_up = forms.IntegerField(required=False)
# #     price_rent = forms.IntegerField(required=False)
# #     file_type = forms.CharField(max_length=10, required=True)
# #     class Meta:
# #         model = Sell
# #         fields = (
# #             'type',
# #             'price',
# #             'm2',
# #             'year',
# #             'owner_name',
# #             'owner_phone',
# #             'address',
# #             'floor',
# #             'elevator',
# #             'storage',
# #             'parking',
# #             'image1',
# #             'image2',
# #             'image3',
# #             'image4',
# #             'image5',
# #         )
# #         def __init__(self, *args, **kwargs):
# #             super(NewSellFile, self).__init__(*args, **kwargs)

# class NewRentFile(forms.ModelForm): 
#     class Meta:
#         model = Rent
#         fields = (
#             'type',
#             'price_up',
#             'price_rent',
#             'm2',
#             'year',
#             'owner_name',
#             'owner_phone',
#             'address',
#             'floor',
#             'elevator',
#             'storage',
#             'parking',
#             'image1',
#             'image2',
#             'image3',
#             'image4',
#             'image5',
#         )
#         def __init__(self, *args, **kwargs):
#             super(NewSellFile, self).__init__(*args, **kwargs)
        
# class SellCommentForm(forms.ModelForm):
    
#     class Meta:
#         model = SellComment
#         fields = ["body"]
#     # def clean_field(self):
#     #     data = self.data    
        
#     #     return data
    
# class RentCommentForm(forms.ModelForm):
    
#     class Meta:
#         model = RentComment
#         fields = ["body"]
#     # def clean_field(self):
#     #     data = self.data    
        
#     #     return data
    
# class SellUpdateForm(forms.ModelForm):
#     class Meta:
#         model = Sell
#         fields = (
#             'type',
#             'price',
#             'm2',
#             'year',
#             'owner_name',
#             'owner_phone',
#             'address',
#             'floor',
#             'elevator',
#             'storage',
#             'parking',
#             'bedroom',
#             'parking_motor',
#             'takhlie',
#             'vahedha',
#             'komod_divari',
#             'bazdid',
#             'tabaghat',
#         )
        
#     def __init__(self, *args, **kwargs) -> None:
#         super(SellUpdateForm, self).__init__(*args, **kwargs)
#         self.fields['type'].required = False
#         self.fields['price'].required = False
#         self.fields['m2'].required = False
#         self.fields['year'].required = False
#         self.fields['owner_name'].required = False
#         self.fields['owner_phone'].required = False
#         self.fields['address'].required = False
#         self.fields['floor'].required = False
#         self.fields['elevator'].required = False
#         self.fields['storage'].required = False
#         self.fields['parking'].required = False
#         self.fields['bazdid'].required = False
#         self.fields['tabaghat'].required = False
#         self.fields['vahedha'].required = False


        
# class RentUpdateForm(forms.ModelForm):
#     class Meta:
#         model = Rent 
#         fields = (
#             'type',
#             'price_up',
#             'price_rent',
#             'm2',
#             'year',
#             'owner_name',
#             'owner_phone',
#             'address',
#             'floor',
#             'elevator',
#             'storage',
#             'parking',
#             'bedroom',
#             'parking_motor',
#             'takhlie',
#             'vahedha',
#             'komod_divari',
#             'bazdid',
#             'tabaghat',
#             'tabdil',
#         )
        
#     def __init__(self, *args, **kwargs) -> None:
#         super(RentUpdateForm, self).__init__(*args, **kwargs)
#         self.fields['type'].required = False
#         self.fields['price_up'].required = False
#         self.fields['price_rent'].required = False
#         self.fields['m2'].required = False
#         self.fields['year'].required = False
#         self.fields['owner_name'].required = False
#         self.fields['owner_phone'].required = False
#         self.fields['address'].required = False
#         self.fields['floor'].required = False
#         self.fields['elevator'].required = False
#         self.fields['storage'].required = False
#         self.fields['parking'].required = False
#         self.fields['bazdid'].required = False
#         self.fields['tabaghat'].required = False
#         self.fields['vahedha'].required = False
    
# class SendInfo(forms.Form):
#     phone = forms.CharField(max_length=11, required=True)
    
# class ImageForm(forms.ModelForm):
#     image = forms.ImageField(label='Image')    
#     class Meta:
#         model = SellImages
#         fields = ('image', )
        
# class ImageForm(forms.ModelForm):
#     image = forms.ImageField(label='Image')    
#     class Meta:
#         model = RentImages
#         fields = ('image', )

