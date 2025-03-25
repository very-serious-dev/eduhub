from django.urls import include, path

urlpatterns = [
    path("internal/v1/", include("edu_app_internal.urls")),
]
