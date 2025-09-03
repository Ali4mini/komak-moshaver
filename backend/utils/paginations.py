from rest_framework.pagination import PageNumberPagination


class StandardPagination(PageNumberPagination):
    """
    A standard pagination class to be used across the project.
    """

    page_size = 10  # The default number of items to return per page
    page_size_query_param = (
        "page_size"  # Allows client to set page size e.g., ?page_size=20
    )
    max_page_size = 100  # The maximum page size the client can request
