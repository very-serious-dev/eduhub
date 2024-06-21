import json
from django.http import JsonResponse
from .models import EPUserClass

def handle_classes(request):
    if request.method == "GET":
        if request.edu_user is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        classes_user = EPUserClass.objects.filter(user=request.edu_user)
        serialized_classes = []
        for uc in classes_user:
            serialized_classes.append(uc.classroom.to_json_obj())
        response = JsonResponse({"classes": serialized_classes})
        return response  
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
