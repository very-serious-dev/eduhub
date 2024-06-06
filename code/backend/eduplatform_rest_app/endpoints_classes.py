import json
from django.http import JsonResponse
from .models import EPClass

def handle_classes(request):
    if request.method == "GET":
        if request.edu_user is None:
            return JsonResponse({"error": "User not authenticated"}, status=401)
        classes = EPClass.objects.filter(author=request.edu_user)
        serialized_classes = []
        for c in classes:
            serialized_classes.append(c.to_json_obj())
        response = JsonResponse({"classes": serialized_classes})
        return response
    elif request.method == "POST":
        if request.edu_user is None:
            return JsonResponse({"error": "User not authenticated"}, status=401)
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Malformed request body"}, status=400)
        json_name = body_json.get("name")
        if json_name is None:
            return JsonResponse({"error": "Missing name in request body"}, status=400)
        if EPClass.objects.filter(name=json_name, author=request.edu_user).exists():
            return JsonResponse({"error": "You have already created a class with that name"}, status=409)
        # Let's create a new class
        new_class = EPClass()
        new_class.author = request.edu_user
        new_class.name = json_name
        new_class.save()
        return JsonResponse({"success": True}, status=201)   
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
