from django.urls import path
from . import endpoints_user, endpoints_classes

urlpatterns = [
    path("sessions", endpoints_user.handle_login),
    path("users", endpoints_user.handle_register),
    path("classes", endpoints_classes.handle_classes)
]
