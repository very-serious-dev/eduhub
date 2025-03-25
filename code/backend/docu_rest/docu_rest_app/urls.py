from django.urls import path

from . import endpoints

urlpatterns = [
    path("sessions", endpoints.login_logout),
    path("documents", endpoints.create_or_delete_documents),
    path("documents/<identifier>", endpoints.get_document)
]
