import json
from django.http import JsonResponse
from .models import EPGroup

def handle_groups(request):
    if request.method == "GET":
        if request.user is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        serialized_groups = []
        for g in EPGroup.objects.all():
            serialized_groups.append(g.to_json_obj())
        response = JsonResponse({"groups": serialized_groups})
        return response  
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
