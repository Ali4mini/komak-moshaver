from file.serializers import RentFileSerializer, SellFileSerializer
from .models import BuyCustomer, RentCustomer
from rest_framework.views import APIView
from rest_framework import generics, status
from rest_framework.response import Response
from .serializers import BuyCustomerSerializer, RentCustomerSerializer

# Create your views here.


# SECTION - API
class BuyCustomerRelatedFiles(APIView):
    def get(self, request, pk):
        if pk is None:
            return Response(
                {"error": "pk is missing"}, status=400
            )  # 400 is the status code for "Bad Request"
        customer = BuyCustomer.objects.get(pk=pk)
        related_customers = customer.get_related_files()
        serializer = SellFileSerializer(related_customers, many=True)
        return Response(serializer.data)


class RentCustomerRelatedFiles(APIView):
    def get(self, request, pk):
        if pk is None:
            return Response(
                {"error": "pk is missing"}, status=400
            )  # 400 is the status code for "Bad Request"
        customer = RentCustomer.objects.get(pk=pk)
        related_customers = customer.get_related_files()
        serializer = RentFileSerializer(related_customers, many=True)
        return Response(serializer.data)


class BuyCustomerDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = BuyCustomer.objects.all()
    serializer_class = BuyCustomerSerializer

    def destroy(self, request, pk=None):
        print("in delete")
        customer = self.get_object()
        customer.status = "UNACTIVE"
        customer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RentCustomerDetails(generics.RetrieveUpdateDestroyAPIView):
    queryset = RentCustomer.objects.all()
    serializer_class = RentCustomerSerializer

    def destroy(self, request, pk=None):
        print("in delete")
        customer = self.get_object()
        customer.status = "UNACTIVE"
        customer.save()
        return Response(status=status.HTTP_204_NO_CONTENT)


class NewBuyCustomer(generics.CreateAPIView):
    queryset = BuyCustomer.objects.all()
    serializer_class = BuyCustomerSerializer


class NewRentCustomer(generics.CreateAPIView):
    queryset = RentCustomer.objects.all()
    serializer_class = RentCustomerSerializer


#!SECTION
