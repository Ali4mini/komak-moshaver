from .models import RentImage, Sell, Rent, SellImage
from rest_framework.parsers import MultiPartParser
from rest_framework.parsers import FileUploadParser
from django.core.files.uploadedfile import UploadedFile
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import requests
from rest_framework import generics
from .serializers import (
    SellFileSerializer,
    RentFileSerializer,
    SellImageSerializer,
    RentImageSerializer,
)
from customer.serializers import BuyCustomerSerializer, RentCustomerSerializer
from django.conf import settings


# Create your views here.


# SECTION - API
class SellFileDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sell.objects.all()
    serializer_class = SellFileSerializer

    def destroy(self, request, pk=None):
        print("in delete")
        file = self.get_object()
        file.status = "UNACTIVE"
        file.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RentFileDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = Rent.objects.all()
    serializer_class = RentFileSerializer

    def destroy(self, request, pk=None):
        print("in delete")
        file = self.get_object()
        file.status = "UNACTIVE"
        file.save()

        return Response(status=status.HTTP_204_NO_CONTENT)


class SellRelatedCustomers(APIView):
    def get(self, request, pk):
        if pk is None:
            return Response(
                {"error": "pk is missing"}, status=400
            )  # 400 is the status code for "Bad Request"
        file = Sell.objects.get(pk=pk)
        related_customers = file.get_related_customers()
        serializer = BuyCustomerSerializer(related_customers, many=True)
        return Response(serializer.data)


class RentRelatedCustomers(APIView):
    def get(self, request, pk):
        if pk is None:
            return Response(
                {"error": "pk is missing"}, status=400
            )  # 400 is the status code for "Bad Request"
        file = Rent.objects.get(pk=pk)
        related_customers = file.get_related_customers()
        serializer = RentCustomerSerializer(related_customers, many=True)
        return Response(serializer.data)


class NewSellFile(generics.CreateAPIView):
    queryset = Sell.objects.all()
    serializer_class = SellFileSerializer


class NewRentFile(generics.CreateAPIView):
    queryset = Rent.objects.all()
    serializer_class = RentFileSerializer


class SellFileImages(APIView):
    parser_class = (FileUploadParser, MultiPartParser)

    def get(self, request, file_id):
        try:
            file = Sell.objects.get(id=file_id)
        except Sell.DoesNotExist:
            raise Http404("File does not exist")

        images = SellImage.objects.filter(file=file)
        if not images:
            return Response(
                {"detail": "No images found for this file."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Include the request context in the serializer
        serializer = SellImageSerializer(
            images, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def post(self, request, file_id):
        file = Sell.objects.get(pk=file_id)
        image_files = request.FILES.getlist("images")

        if not image_files:
            return Response(
                {"detail": "No file was provided in the request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Create a new SellImage instance for each uploaded file
        created_images = []
        for image_file in image_files:
            image = SellImage.objects.create(image=image_file, file=file)
            created_images.append(image)

        # Assuming you have a serializer for SellImage
        serializer = SellImageSerializer(
            created_images, many=True, context={"request": request}
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SellSendInfo(APIView):
    def post(self, request, pk):
        phone_numbers = request.data.get("phone_numbers")
        file = Sell.objects.get(pk=pk)

        if file.elevator:
            elevator = "دارد"
        else:
            elevator = "ندارد"
        if file.storage:
            storage = "دارد"
        else:
            storage = "ندارد"
        if file.parking:
            parking = "دارد"
        else:
            parking = "ندارد"

        sell_template = f"""
        آدرس : {file.address}
        متراژ: {file.m2}
        قیمت: {file.price}
        طبقه: {file.floor}
        آسانسور: {elevator}
        پارکینگ: {parking}
        انباری: {storage}
        """

        data = {
            "from": "50004001845778",
            "to": phone_numbers,
            "text": sell_template,
            "udh": "",
        }
        response = requests.post(settings.SMS_API, json=data)
        return Response(response)


# TODO: RentSendInfo
