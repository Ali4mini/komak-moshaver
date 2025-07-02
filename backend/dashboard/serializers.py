from rest_framework import serializers
from .models import Task

# Make sure your other models are importable if needed for type checking
# from file.models import Sell, Rent


class RelatedObjectSerializer(serializers.ModelSerializer):
    """
    A generic serializer for the related object to provide a consistent format.
    This is an example; you'll need to create this based on your models.
    For now, we'll build it dynamically in the TaskSerializer.
    """

    pass  # We will handle this directly in the TaskSerializer for simplicity


class TaskSerializer(serializers.ModelSerializer):
    # NEW: A field to represent the related object in a frontend-friendly way
    related_object = serializers.SerializerMethodField()

    class Meta:
        model = Task
        fields = [
            "id",
            "text",
            "completed",
            "due_date",
            "is_archived",
            "created_at",
            "updated_at",
            "related_object",  # Add new field here
        ]

    def get_related_object(self, obj):
        """
        This method creates a dictionary with info about the linked object.
        """
        if obj.content_object:
            # Get the model name (e.g., 'sell', 'rent', 'customer')
            model_name = obj.content_type.model.lower()

            # This is where you define the URL structure of your frontend app
            url_prefix = f"/{model_name}s"  # e.g., /sells, /rents, /customers
            if model_name in ["sell", "rent"]:
                url_prefix = f"/file/{model_name}"  # e.g., /files/sell, /files/rent

            return {
                "id": obj.object_id,
                "type": model_name,
                # Example: "فروش-123" or "مشتری C-45"
                "display_text": str(obj.content_object),
                # Example: "/files/sell/123" or "/customers/45"
                "url": f"{url_prefix}/{obj.object_id}",
            }
        return None
