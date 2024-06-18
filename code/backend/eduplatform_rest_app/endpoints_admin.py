import bcrypt, json
from django.http import JsonResponse
from .models import EPUser, EPGroup, EPClass

def home(request):
    if request.method == "GET":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        users_count = EPUser.objects.all().count()
        classes_count = EPClass.objects.all().count()
        serialized_groups = []
        for group in EPGroup.objects.all():
            serialized_groups.append(group.to_json_obj())
        return JsonResponse({"usersCount": users_count,
                             "classesCount": classes_count,
                             "groups": serialized_groups })
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
    
def handle_users(request):
    if request.method == "GET":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        serialized_users = []
        for user in EPUser.objects.all():
            serialized_users.append(user.to_json_obj())
        return JsonResponse({"users": serialized_users})
    elif request.method == "POST":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_username = body_json.get("username")
        json_name = body_json.get("name")
        json_surname = body_json.get("surname")
        json_password = body_json.get("password")
        if json_username is None or json_name is None or json_surname is None or json_password is None:
            return JsonResponse({"error": "Falta username, name, surname o password en el cuerpo de la petición"}, status=400)
        # TO-DO: Validate username; should only contain lowercase letters and dots (.)
        if EPUser.objects.filter(username=json_username).exists():
            return JsonResponse({"error": "Ese usuario ya está registrado"}, status=409)
        new_user = EPUser()
        json_student_group = body_json.get("student_group")
        json_is_teacher = body_json.get("is_teacher", False)
        if json_student_group is not None and EPGroup.objects.filter(tag=json_student_group).exists():
            new_user.student_registered_group = EPGroup.objects.get(tag=json_student_group)
        elif json_is_teacher:
            new_user.is_teacher = True
        else:
            # School leader and Sysadmin must be manually added
            # Thus, if execution reaches here, request was incorrect
            return JsonResponse({"error": "Falta student_group o is_teacher"}, status=400)
        salted_and_hashed_pass = bcrypt.hashpw(json_password.encode('utf8'), bcrypt.gensalt()).decode('utf8')
        new_user.username = json_username
        new_user.name = json_name
        new_user.surname = json_surname
        new_user.encrypted_password = salted_and_hashed_pass
        #user.is_sysadmin = True
        new_user.save()
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)


def handle_groups(request):
    if request.method == "GET":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        serialized_groups = []
        for group in EPGroup.objects.all():
            serialized_groups.append(group.to_json_obj())
        return JsonResponse({"groups": serialized_groups})
    elif request.method == "POST":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_tag = body_json.get("tag")
        json_name = body_json.get("name")
        json_tutor_username = body_json.get("tutor_username")
        if json_tag is None or json_name is None or json_tutor_username is None:
            return JsonResponse({"error": "Falta tag, name o tutor_username en el cuerpo de la petición"}, status=400)
        if EPGroup.objects.filter(tag=json_tag).exists():
            return JsonResponse({"error": "Ese grupo ya está registrado"}, status=409)
        if EPUser.objects.filter(username=json_tutor_username).exists() == False:
            return JsonResponse({"error": "El tutor indicado no existe"}, status=409)
        new_group = EPGroup()
        new_group.tag = json_tag
        new_group.name = json_name
        new_group.tutor = EPUser.objects.get(username=json_surname)
        new_group.save()
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
    
def handle_classes(request):
    if request.method == "GET":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        serialized_classes = []
        for cls in EPClass.objects.all():
            serialized_classes.append(cls.to_json_obj())
        return JsonResponse({"classes": serialized_classes})
    elif request.method == "POST":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_name = body_json.get("name")
        json_group = body_json.get("group")
        if json_name is None or json_group is None:
            return JsonResponse({"error": "Falta name o group en el cuerpo de la petición"}, status=400)
        if EPGroup.objects.filter(tag=json_group).exists() == False:
            return JsonResponse({"error": "El grupo indicado al que debe pertenecer la clase no existe"}, status=409)
        new_class = EPClass()
        new_class.name = json_name
        new_class.group = EPGroup.objects.get(tag=json_group)
        new_class.save()
        # TO-DO: Feature: Automatically add to the new class all users belonging to group
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def __admin_auth_json_error_response(request):
    if request.edu_user is None:
        return JsonResponse({"error": "Usuario no autenticado"}, status=401)
    if request.edu_user.is_sysadmin == False and request.edu_user.is_school_leader == False:
        return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
    return None
