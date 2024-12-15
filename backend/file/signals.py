# import requests
# from django.db.models.signals import post_save
# from django.dispatch import receiver
# from .models import SellImage
#
#
# @receiver(post_save, sender=SellImage)
# def download_image(sender, instance, created, **kwargs):
#     if created and instance.image.url:
#         # Download the image from the provided URL
#         response = requests.get(instance.image.url)
#
#         if response.status_code == 200:
#             # Save the image content to the model's ImageField
#             instance.image.save(
#                 instance.image.name, ContentFile(response.content), save=False
#             )
#             instance.save()  # Save the instance again to update the image field
#
