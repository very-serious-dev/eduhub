from django.urls import path

from . import endpoints_sessions

urlpatterns = [
    path("sessions", endpoints_sessions.login_logout)
]
