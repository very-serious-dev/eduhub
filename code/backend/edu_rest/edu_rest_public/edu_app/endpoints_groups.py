import json
from django.http import JsonResponse
from .models import User, Group, Announcement
from .serializers import groups_array_to_json, announcements_array_to_json

def get_all_groups(request):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        groups = Group.objects.all()
        return JsonResponse({"groups": groups_array_to_json(groups) })  
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def handle_group_announcements(request, groupTag):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            group = Group.objects.get(tag=groupTag)
        except Group.DoesNotExist:
            return JsonResponse({"error": "Ese grupo no existe"}, status=404)
        if request.session.user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            canSee = True
            canCreate = True
        elif request.session.user.role in [User.UserRole.TEACHER]:
            canSee = True # All teachers can access all announcements boards
            canCreate = group.tutor == request.session.user
        else:
            canSee = request.session.user.student_group == group
        if not canSee:
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        announcements = Announcement.objects.filter(group=group).order_by("-publication_date")
        return JsonResponse({"success": True,
                             "announcements": announcements_array_to_json(announcements),
                             "can_create_announcements": canCreate})
    elif request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            group = Group.objects.get(tag=groupTag)
        except Group.DoesNotExist:
            return JsonResponse({"error": "Ese grupo no existe"}, status=404)
        if request.session.user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            hasPermission = True
        elif request.session.user.role in [User.UserRole.TEACHER]:
            hasPermission = group.tutor == request.session.user
        else:
            hasPermission = False
        if not hasPermission:
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_title = body_json.get("title")
        json_content = body_json.get("content")
        if json_title is None or json_content is None:
            return JsonResponse({"error": "Falta title o content en el cuerpo de la petición"}, status=400)
        new_announcement = Announcement()
        new_announcement.title = json_title
        new_announcement.content = json_content
        new_announcement.author = request.session.user
        new_announcement.group = group
        new_announcement.save()
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

