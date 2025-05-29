from django.urls import include, path

urlpatterns = [
    path("api/v1/", include("docu_rest_app.urls")),
]
