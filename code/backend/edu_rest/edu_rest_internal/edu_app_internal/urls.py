from django.urls import path
from . import endpoints

urlpatterns = [
    path("sessions", endpoints.verify_session),
    path("documents", endpoints.create_or_delete_documents),
    path("documents/permissions", endpoints.documents_permissions),
]
