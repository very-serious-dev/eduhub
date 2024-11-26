import json
from django.http import JsonResponse
from .models import EPClass, EPUserClass, EPUnit, EPPost
from .models import EPUSER_STUDENT, EPUSER_TEACHER, EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER

def create_post(request, classId):
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role not in [EPUSER_TEACHER, EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER]:
            # Student - can't create posts inside a class (?)
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        if request.session.user.role == EPUSER_TEACHER and EPUserClass.objects.filter(user=request.session.user, classroom=classroom).count() == 0:
            # Regular teacher trying to edit another teacher's class
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_title = body_json.get("title")
        json_unit_id = body_json.get("unit_id")
        json_content = body_json.get("content")
        if json_content is None:
            return JsonResponse({"error": "Falta content en el cuerpo de la petición"}, status=400)
        if json_unit_id is None:
            unit = None
        else:
            try:
                unit = EPUnit.objects.get(id=json_unit_id)
            except EPUnit.DoesNotExist:
                return JsonResponse({"error": "No existe un tema con ese id"}, status=404)
        new_post = EPPost()
        new_post.title = json_title # Can be null
        new_post.content = json_content
        new_post.unit = unit
        new_post.classroom = classroom
        # TO-DO: Task due date, post type (add to models.py too)
        new_post.save()
        return JsonResponse({"success": True}, status=201) 
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
