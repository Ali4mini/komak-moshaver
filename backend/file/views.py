from .models import (
    RentImage,
    Sell,
    Rent,
    SellImage,
    SellStaticLocation,
    RentStaticLocation,
)
from rest_framework.parsers import MultiPartParser
from rest_framework.parsers import FileUploadParser
from django.http import Http404
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, viewsets
from .serializers import (
    SellFileSerializer,
    RentFileSerializer,
    SellImageSerializer,
    RentImageSerializer,
    SellStaticLocationSerializer,
    RentStaticLocationSerializer,
)
from customer.serializers import BuyCustomerSerializer, RentCustomerSerializer
from .tasks import (
    send_message,
)

# Create your views here.


# SECTION - API
class SellFileDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = Sell.objects.all()
    serializer_class = SellFileSerializer

    def destroy(self, request, pk=None):
        file = self.get_object()
        file.status = "UNACTIVE"
        file.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RentFileDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = Rent.objects.all()
    serializer_class = RentFileSerializer

    def destroy(self, request, pk=None):
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
        print(f"pk: {pk}")
        phone_numbers = request.data.get("phone_numbers")

        print(f"phone number: {phone_numbers}")
        file = Sell.objects.filter(pk=pk)
        print(f"file: {file}")
        send_message.delay(phone_numbers, file)

        return Response("Task has been queued.")


class RentSendInfo(APIView):
    def post(self, request, pk):
        phone_numbers = request.data.get("phone_numbers")

        file = Rent.objects.get(pk)
        send_message.delay(phone_numbers, file)

        return Response("Task has been queued.")


class RentStaticLocationView(APIView):
    """
    API view for handling RentStaticLocation instances.
    """

    def post(self, request, file_id, *args, **kwargs):
        # Validate that the Rent instance exists
        try:
            file = Rent.objects.get(id=file_id)
        except Rent.DoesNotExist:
            return Response(
                {
                    "detail": "The specified file does not exist.",
                    "status": status.HTTP_404_NOT_FOUND,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Handle the creation of a new instance
        serializer = RentStaticLocationSerializer(data=request.data)

        if serializer.is_valid(raise_exception=True):
            serializer.save(file=file)  # Associate with the existing Rent instance
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # If validation fails, return errors
        return Response(
            {
                "detail": "Invalid data provided.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def get(self, request, file_id):
        try:
            file = Rent.objects.get(id=file_id)
        except Rent.DoesNotExist:
            return Response(
                {
                    "detail": "the file doesnt exist",
                    "status": status.HTTP_404_NOT_FOUND,
                }
            )

        try:
            images = RentStaticLocation.objects.get(file=file)
        except RentStaticLocation.DoesNotExist:
            return Response(
                {"detail": "No static map found for this file."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = RentStaticLocationSerializer(
            images, many=False, context={"request": request}
        )

        return Response(serializer.data)


class SellStaticLocationView(APIView):
    """
    API view for handling SellStaticLocation instances.
    """

    def post(self, request, file_id, *args, **kwargs):
        # Validate that the Sell instance exists
        try:
            file = Sell.objects.get(id=file_id)
        except Sell.DoesNotExist:
            return Response(
                {
                    "detail": "The specified file does not exist.",
                    "status": status.HTTP_404_NOT_FOUND,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        # Handle the creation of a new instance
        serializer = SellStaticLocationSerializer(data=request.data)

        if serializer.is_valid(raise_exception=False):
            serializer.save(file=file)  # Associate with the existing Sell instance
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        # If validation fails, return errors
        return Response(
            {
                "detail": "Invalid data provided.",
                "errors": serializer.errors,
            },
            status=status.HTTP_400_BAD_REQUEST,
        )

    def get(self, request, file_id):
        try:
            file = Sell.objects.get(id=file_id)
        except Sell.DoesNotExist:
            return Response(
                {
                    "detail": "the file doesnt exist",
                    "status": status.HTTP_404_NOT_FOUND,
                }
            )

        try:
            images = SellStaticLocation.objects.get(file=file)
        except SellStaticLocation.DoesNotExist:
            return Response(
                {"detail": "No static map found for this file."},
                status=status.HTTP_404_NOT_FOUND,
            )

        serializer = SellStaticLocationSerializer(
            images, many=False, context={"request": request}
        )

        return Response(serializer.data)
