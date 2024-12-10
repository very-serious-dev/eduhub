from django.urls import include, path

urlpatterns = [
    path("api/v1/", include("eduplatform_rest_app.urls")),
    
]
