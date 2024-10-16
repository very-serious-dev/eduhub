import json
from django.http import JsonResponse
from .models import EPGroup
from .serializers import groups_array_to_json

def handle_groups(request):
    if request.method == "GET":
        if request.user is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        groups = EPGroup.objects.all()
        return JsonResponse({"groups": groups_array_to_json(groups) })  
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
