from django.contrib.auth.views import LoginView, LogoutView


class GenericLoginView(LoginView):
    next_page = "/"


class GenericLogoutView(LogoutView):
    next_page = "/"
