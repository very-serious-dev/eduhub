import json
from django.http import JsonResponse
from . import common
from .models import EPClass

def handle_classes(request):
    if request.method == "GET":
        user = common.get_request_user(request)
        if user is None:
            return JsonResponse({"error": "User not authenticated"}, status=401)
        classes = EPClass.objects.filter(author=user)
        response = []
        for c in classes:
            response.append(c.to_json_obj())
        return JsonResponse({"classes": response})
    elif request.method == "POST":
        user = common.get_request_user(request)
        if user is None:
            return JsonResponse({"error": "User not authenticated"}, status=401)
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Malformed request body"}, status=400)
        json_name = body_json.get("name")
        if json_name is None:
            return JsonResponse({"error": "Missing name in request body"}, status=400)
        if EPClass.objects.filter(name=json_name, author=user).exists():
            return JsonResponse({"error": "You have already created a class with that name"}, status=409)
        # Let's create a new class
        new_class = EPClass()
        new_class.author = user
        new_class.name = json_name
        new_class.save()
        return JsonResponse({"success": True}, status=201)   
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
