import json, random
from django.http import JsonResponse
from .models import EPUser, EPClass, EPUserClass, EPGroup, EPUnit
from .models import EPUSER_STUDENT, EPUSER_TEACHER, EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER
from .serializers import groups_array_to_json, classes_array_to_json, users_array_to_json, class_detail_to_json

# TO-DO: Improve some CTRL+C, CTRL+V in privileges check throughout this file

def get_all_groups(request):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        groups = EPGroup.objects.all()
        return JsonResponse({"groups": groups_array_to_json(groups) })  
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def handle_classes(request):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        users_classes = EPUserClass.objects.filter(user=request.session.user, classroom__archived=False)
        classes = list(map(lambda uc: uc.classroom, users_classes))
        return JsonResponse({"classes": classes_array_to_json(classes)})
    elif request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        if request.session.user.role not in [EPUSER_TEACHER, EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER]:
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_name = body_json.get("name")
        json_group = body_json.get("group")
        json_automatically_add_teacher = body_json.get("automaticallyAddTeacher")
        if json_name is None or json_group is None:
            return JsonResponse({"error": "Falta name o group en el cuerpo de la petición"}, status=400)
        if EPGroup.objects.filter(tag=json_group).exists() == False:
            return JsonResponse({"error": "El grupo indicado al que debe pertenecer la clase no existe"}, status=409)
        new_class = EPClass()
        new_class.name = json_name
        new_class.group = EPGroup.objects.get(tag=json_group)
        r = lambda: random.randint(0,255)
        new_class.color = '#{:02x}{:02x}{:02x}'.format(r(), r(), r()) # https://stackoverflow.com/a/14019260
        new_class.save()
        if json_automatically_add_teacher is True:
            new_user_class = EPUserClass()
            new_user_class.user = request.session.user
            new_user_class.classroom = new_class
            new_user_class.save()
        # TO-DO: Feature: Automatically add to the new class all users belonging to group
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
        
def handle_class_detail(request, classId):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role not in [EPUSER_TEACHER, EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER]:
            isClassEditableByUser = False
        else:
            isClassEditableByUser = EPUserClass.objects.filter(user=request.session.user, classroom=classroom).count() > 0
        return JsonResponse(class_detail_to_json(classroom, isClassEditableByUser))
    elif request.method == "PUT":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role not in [EPUSER_TEACHER, EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER]:
            # Student - can't edit classes
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        if request.session.user.role == EPUSER_TEACHER and EPUserClass.objects.filter(user=request.session.user, classroom=classroom).count() == 0:
            # Regular teacher trying to edit another teacher's class
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_name = body_json.get("name")
        json_color = body_json.get("color")
        if json_name is None or json_color is None:
            return JsonResponse({"error": "Falta name o color en el cuerpo de la petición"}, status=400)
        classroom.name = json_name
        classroom.color = json_color
        classroom.save()
        return JsonResponse({"success": True}, status=200)
    elif request.method == "DELETE":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role not in [EPUSER_TEACHER, EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER]:
            # Student - can't edit classes
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        if request.session.user.role == EPUSER_TEACHER and EPUserClass.objects.filter(user=user, classroom=classroom).count() == 0:
            # Regular teacher trying to edit another teacher's class
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        classroom.archived = True
        classroom.save()
        return JsonResponse({"success": True}, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def handle_class_participants(request, classId):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        users_class = EPUserClass.objects.filter(classroom=classroom)
        if request.session.user.role in [EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER]:
            has_permission_to_see = True
        else:
            has_permission_to_see = users_class.filter(user=request.session.user).exists()
        if not(has_permission_to_see):
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        users = list(map(lambda uc: uc.user, users_class))
        return JsonResponse({"users": users_array_to_json(users)}, status=200)
    elif request.method == "PUT":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role == EPUSER_STUDENT:
            has_permission_to_edit = False
        elif request.session.user.role in [EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER]:
            has_permission_to_edit = True
        else: # Regular teacher
            has_permission_to_edit = EPUserClass.objects.filter(classroom=classroom, user=request.session.user).exists()
        if not(has_permission_to_edit):
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_username = body_json.get("username")
        if json_username is None:
            return JsonResponse({"error": "Falta username en el cuerpo de la petición"}, status=400)
        failed_inexistent_users = []
        failed_already_added_users = []
        for non_trimmed_username in json_username.split(","):
            username = non_trimmed_username.strip()
            if len(username) > 0:
                try:
                    user = EPUser.objects.get(username=username)
                    if EPUserClass.objects.filter(user=user, classroom=classroom).exists():
                        failed_already_added_users.append(username)
                    else:
                        new_user_class = EPUserClass()
                        new_user_class.user = user
                        new_user_class.classroom = classroom
                        new_user_class.save()
                except EPUser.DoesNotExist:
                    failed_inexistent_users.append(username)
        if len(failed_inexistent_users) == 0 and (failed_already_added_users) == 0:
            return JsonResponse({"success": True}, status=201)
        else:
            error_msg = ""
            if len(failed_inexistent_users) > 0:
                error_msg += "Usuario(s) inexistente(s): " + ", ".join(failed_inexistent_users) + ". "
            if len(failed_already_added_users) > 0:
                error_msg += "Usuario(s) ya pertenece(n) a la clase: " + ", ".join(failed_already_added_users)
            return JsonResponse({"partial_success": True, "error": error_msg}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def delete_class_participant(request, classId, username):
    if request.method == "DELETE":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role == EPUSER_STUDENT:
            has_permission_to_edit = False
        elif request.session.user.role in [EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER]:
            has_permission_to_edit = True
        else: # Regular teacher
            has_permission_to_edit = EPUserClass.objects.filter(classroom=classroom, user=request.session.user).exists()
        if not(has_permission_to_edit):
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        try:
            user_class = EPUserClass.objects.get(classroom=classroom, user__username=username)
            user_class.delete()
            return JsonResponse({"success": True}, status=200)
        except EPUserClass.DoesNotExist:
            return JsonResponse({"error": "El usuario no pertenece a esa clase"}, status=404)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def create_class_unit(request, classId):
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role == EPUSER_STUDENT:
            has_permission_to_edit = False
        elif request.session.user.role in [EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER]:
            has_permission_to_edit = True
        else: # Regular teacher
            has_permission_to_edit = EPUserClass.objects.filter(classroom=classroom, user=request.session.user).exists()
        if not(has_permission_to_edit):
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_name = body_json.get("name")
        if json_name is None:
            return JsonResponse({"error": "Falta name en el cuerpo de la petición"}, status=400)
        try:
            EPUnit.objects.get(classroom=classroom, name=json_name)
            return JsonResponse({"error": "Ya existe una clase con ese nombre"}, status=409)
        except EPUnit.DoesNotExist:
            # Doesn't exist, create it
            new_unit = EPUnit()
            new_unit.name = json_name
            new_unit.classroom = classroom
            new_unit.save()
            return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def handle_class_unit(request, classId, unitId):
    if request.method in ["PUT", "DELETE"]:
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role == EPUSER_STUDENT:
            has_permission_to_edit = False
        elif request.session.user.role in [EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER]:
            has_permission_to_edit = True
        else: # Regular teacher
            has_permission_to_edit = EPUserClass.objects.filter(classroom=classroom, user=request.session.user).exists()
        if not(has_permission_to_edit):
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        try:
            unit = EPUnit.objects.get(id=unitId)
            if request.method == "PUT":
                try:
                    body_json = json.loads(request.body)
                except json.decoder.JSONDecodeError:
                    return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
                json_name = body_json.get("name")
                if json_name is None:
                    return JsonResponse({"error": "Falta name en el cuerpo de la petición"}, status=400)
                unit.name = json_name
                unit.save()
                return JsonResponse({"success": True}, status=200)
            elif request.method == "DELETE":
                unit.delete()
                return JsonResponse({"success": True}, status=200)
            else:
                return JsonResponse({"error": "Server error"}, status=500)
        except EPUnit.DoesNotExist:
            return JsonResponse({"error": "No existe ese tema"}, status=404)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
