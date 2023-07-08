from django.db import models
from taggit.managers import TaggableManager
from django.urls import reverse
from agents_m.models import Profile
from django.conf import settings
# Create your models here.

class Sell(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = 'A', 'آپارتمان'
        LAND = 'L', 'زمین و کلنگی'
        STORE = 'S', 'مغازه و غرفه'
        VILA = 'H', 'خانه و ویلا'
        
    class Meta:
        ordering = ['-created']
        
    owner_name = models.CharField(max_length=1000)
    owner_phone = models.CharField(max_length=12)
    address = models.TextField()
    m2 = models.IntegerField()
    price = models.IntegerField()
    year = models.IntegerField()
    floor = models.IntegerField(blank=True)
    elevator = models.BooleanField(default=True)
    storage = models.BooleanField(default=True)
    parking = models.BooleanField(default=True)
    # pictures = models.ImageField(upload_to='pictures', blank=True)
    type = models.CharField(max_length=1, choices=Types.choices, default=Types.APARTEMANT)
    added_by = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 verbose_name=("added to site by "),
                                 on_delete=models.DO_NOTHING,
                                 blank=False,
                                 default=1
                                 )
    bedroom = models.IntegerField(blank=True, null=True)
    parking_motor = models.BooleanField(default=False)
    takhlie = models.CharField(max_length=100, null=True)
    vahedha = models.IntegerField(null=True)
    komod_divari = models.BooleanField(default=False)
    bazdid = models.CharField(max_length=100, null=True)
    tabaghat = models.IntegerField(null=True)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    
    image1 = models.ImageField(upload_to='images/', blank=True)
    image2 = models.ImageField(upload_to='images/', blank=True)
    image3 = models.ImageField(upload_to='images/', blank=True)
    image4 = models.ImageField(upload_to='images/', blank=True)
    image5 = models.ImageField(upload_to='images/', blank=True)   
    
    tag_manager = TaggableManager(blank=True)



    def __str__(self):
        return f"owner: {self.owner_name} owner's phone: {self.owner_phone}"
    
    def get_absolute_url(self):
        return reverse("file:sell_file_detail", args=[self.id])
    
    def get_pk(self) -> int:
        return self.pk

class Rent(models.Model):
    class Types(models.TextChoices):
        APARTEMANT = 'A', 'آپارتمان'
        LAND = 'L', 'زمین و کلنگی'
        STORE = 'S', 'اداری و تجاری'
        VILA = 'H', 'خانه و ویلا'
        
    class Meta:
        ordering = ['-created']
        
    owner_name = models.CharField(max_length=1000)
    owner_phone = models.CharField(max_length=12)
    address = models.TextField()
    m2 = models.IntegerField()
    price_up = models.FloatField()
    price_rent = models.FloatField()
    year = models.IntegerField()
    floor = models.IntegerField()
    elevator = models.BooleanField(default=True)
    storage = models.BooleanField(default=True)
    parking = models.BooleanField()
    type = models.CharField(max_length=1, choices=Types.choices, default=Types.APARTEMANT)
    added_by = models.ForeignKey(settings.AUTH_USER_MODEL,
                                 verbose_name=("added to site by "),
                                 on_delete=models.DO_NOTHING,
                                 blank=False,)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    bedroom = models.IntegerField(blank=True, null=True)
    parking_motor = models.BooleanField(default=False)
    takhlie = models.CharField(max_length=100, null=True)
    vahedha = models.IntegerField(null=True)
    komod_divari = models.BooleanField(default=False)
    bazdid = models.CharField(max_length=100, null=True)
    tabdil = models.BooleanField(default=False)
    tabaghat = models.IntegerField(null=True)

    image1 = models.ImageField(upload_to='images/', blank=True)
    image2 = models.ImageField(upload_to='images/', blank=True)
    image3 = models.ImageField(upload_to='images/', blank=True)
    image4 = models.ImageField(upload_to='images/', blank=True)
    image5 = models.ImageField(upload_to='images/', blank=True)   
    

    tags_manager = TaggableManager(blank=True)

    def __str__(self):
        return f"owner: {self.owner_name} owner's phone: {self.owner_phone}"
    
    def get_absolute_url(self):
        return reverse("file:rent_file_detail", args=[self.id])
    
    def get_pk(self) -> int:
        return self.pk

class SellComment(models.Model):
    file = models.ForeignKey("Sell",
                             verbose_name=("file"),
                             on_delete=models.CASCADE,
                             related_name='sell_comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             verbose_name=("user's profile"),
                             on_delete=models.CASCADE,
                             related_name='sell_comments')
    body = models.TextField(max_length=10000)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        verbose_name = ("Comment")
        verbose_name_plural = ("Comments")

    def __str__(self):
        return f'comment by {self.user} on {self.file}'

    def get_absolute_url(self):
        return reverse("sell_comment", kwargs={"pk": self.pk})
    
    def get_pk(self) -> int:
        return self.pk
    
class RentComment(models.Model):
    file = models.ForeignKey("Rent",
                             on_delete=models.CASCADE,
                             related_name='rent_comments')
    user = models.ForeignKey(settings.AUTH_USER_MODEL,
                             verbose_name=("user's profile"),
                             on_delete=models.CASCADE,
                             related_name='rent_comments')
    body = models.TextField(max_length=10000)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    active = models.BooleanField(default=True)

    class Meta:
        verbose_name = ("Comment")
        verbose_name_plural = ("Comments")

    def __str__(self):
        return f'comment by {self.user} on {self.file}'

    def get_absolute_url(self):
        return reverse("rent_comment", kwargs={"pk": self.pk})
    
    def get_pk(self) -> int:
        return self.pk
    
class SellImages(models.Model):
    post = models.ManyToManyField("Sell", verbose_name=("post"), related_name='Images')
    image = models.ImageField(upload_to='images',
                              verbose_name='Image')
class RentImages(models.Model):
    post = models.ManyToManyField("Rent", verbose_name=("post"), related_name='Images')
    image = models.ImageField(upload_to='images',
                              verbose_name='Image')