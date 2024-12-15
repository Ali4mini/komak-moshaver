from .models import RentImage, Sell, Rent, SellImage
from rest_framework.parsers import MultiPartParser
from rest_framework.parsers import FileUploadParser
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework import generics
from .serializers import (
    SellFileSerializer,
    RentFileSerializer,
    SellImageSerializer,
    RentImageSerializer,
)
from customer.serializers import BuyCustomerSerializer, RentCustomerSerializer
from .tasks import send_sell_message, send_rent_message

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
            return Response(
                {
                    "detail": "the images doesnt exist",
                    "status": status.HTTP_404_NOT_FOUND,
                }
            )

        images = SellImage.objects.filter(file=file)
        if not images:
            return Response(
                {"detail": "No images found for this file."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SellImageSerializer(
            images, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def post(self, request, file_id):
        try:
            file = Sell.objects.get(pk=file_id)
        except Sell.DoesNotExist:
            return Response(
                {"details": "the file_id DoesNotExist"},
                status=status.HTTP_404_NOT_FOUND,
            )

        image_files = request.FILES.getlist("images")

        if not image_files:
            return Response(
                {"detail": "No file was provided in the request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_images = []
        for image_file in image_files:
            image = SellImage.objects.create(image=image_file, file=file)
            created_images.append(image)

        serializer = SellImageSerializer(
            created_images, many=True, context={"request": request}
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class RentFileImages(APIView):
    parser_class = (FileUploadParser, MultiPartParser)

    def get(self, request, file_id):
        try:
            file = Rent.objects.get(id=file_id)
        except Rent.DoesNotExist:
            raise Http404("File does not exist")

        images = RentImage.objects.filter(file=file)
        if not images:
            return Response(
                {"detail": "No images found for this file."},
                status=status.HTTP_404_NOT_FOUND,
            )

        # Include the request context in the serializer
        serializer = RentImageSerializer(
            images, many=True, context={"request": request}
        )
        return Response(serializer.data)

    def post(self, request, file_id):
        try:
            file = Rent.objects.get(pk=file_id)
        except Rent.DoesNotExist:
            return Response(
                {"details": "the file_id DoesNotExist"},
                status=status.HTTP_404_NOT_FOUND,
            )

        image_files = request.FILES.getlist("images")

        if not image_files:
            return Response(
                {"detail": "No file was provided in the request."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        created_images = []
        for image_file in image_files:
            image = RentImage.objects.create(image=image_file, file=file)
            created_images.append(image)

        serializer = RentImageSerializer(
            created_images, many=True, context={"request": request}
        )

        return Response(serializer.data, status=status.HTTP_201_CREATED)


class SellSendInfo(APIView):
    def post(self, request, pk):
        phone_numbers = request.data.get("phone_numbers")

        send_sell_message.delay(phone_numbers, pk)

        return Response("Task has been queued.")


class RentSendInfo(APIView):
    def post(self, request, pk):
        phone_numbers = request.data.get("phone_numbers")

        send_rent_message.delay(phone_numbers, pk)

        return Response("Task has been queued.")
