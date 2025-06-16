import bcrypt, json, re
from django.http import JsonResponse
from django.db.models import Q
from .models import User, Group, Class, UserClass, UserSession
from .serializers import groups_array_to_json, classes_array_to_json, users_array_to_json

TEACHER_MAX_FOLDERS = 500
TEACHER_MAX_DOCUMENTS = 2000
TEACHER_MAX_DOCUMENTS_SIZE = 5 * 1024 * 1024 * 1024 # 5Gb
STUDENT_MAX_FOLDERS = 50
STUDENT_MAX_DOCUMENTS = 200
STUDENT_MAX_DOCUMENTS_SIZE = 1 * 1024 * 1024 * 512 # 500Mb

def home(request):
    if request.method == "GET":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        users_count = User.objects.filter(archived=False).count()
        classes_count = Class.objects.filter(archived=False).count()
        serialized_groups = []
        groups = Group.objects.all()
        return JsonResponse({"usersCount": users_count,
                             "classesCount": classes_count,
                             "groups": groups_array_to_json(groups) })
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
    
def create_user(request):
    if request.method == "POST":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_username = body_json.get("username")
        json_name = body_json.get("name")
        json_surname = body_json.get("surname")
        json_password = body_json.get("password")
        json_student_group = body_json.get("student_group")
        json_is_teacher = body_json.get("is_teacher", False)
        if json_username is None or json_name is None or json_surname is None or json_password is None:
            return JsonResponse({"error": "Falta username, name, surname o password en el cuerpo de la petición"}, status=400)
        if not(re.match("^[a-z0-9.]+$", json_username)):
            return JsonResponse({"error": "El nombre de usuario no es válido. Sólo puede contener letras en minúscula, dígitos y puntos (.)"}, status=409)
        if User.objects.filter(username=json_username).exists():
            return JsonResponse({"error": "Ese usuario ya está registrado"}, status=409)
        new_user = User()
        new_user.username = json_username
        new_user.name = json_name
        new_user.surname = json_surname
        new_user.encrypted_password = bcrypt.hashpw(json_password.encode('utf8'), bcrypt.gensalt()).decode('utf8')
        if json_is_teacher:
            new_user.role = User.UserRole.TEACHER
            new_user.max_folders = TEACHER_MAX_FOLDERS
            new_user.max_documents = TEACHER_MAX_DOCUMENTS
            new_user.max_documents_size = TEACHER_MAX_DOCUMENTS_SIZE
        elif json_student_group is not None:
            try:
                group = Group.objects.get(tag=json_student_group)
            except Group.DoesNotExist:
                return JsonResponse({"error": "El grupo especificado no existe"}, status=409)
            new_user.role = User.UserRole.STUDENT
            new_user.student_group = group
            new_user.max_folders = STUDENT_MAX_FOLDERS
            new_user.max_documents = STUDENT_MAX_DOCUMENTS
            new_user.max_documents_size = STUDENT_MAX_DOCUMENTS_SIZE
        else:
            # School leader and Sysadmin must be manually added
            # Thus, if execution reaches here, request was incorrect
            return JsonResponse({"error": "Falta student_group o is_teacher"}, status=400)
        new_user.save()
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def handle_user(request, username):
    if request.method == "PUT":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_username = body_json.get("username")
        json_name = body_json.get("name")
        json_surname = body_json.get("surname")
        json_password = body_json.get("password")
        if json_username is None or json_name is None or json_surname is None:
            return JsonResponse({"error": "Falta username, name, surname o password en el cuerpo de la petición"}, status=400)
        if not(re.match("^[a-z0-9.]+$", json_username)):
            return JsonResponse({"error": "El nombre de usuario no es válido. Sólo puede contener letras en minúscula, dígitos y puntos (.)"}, status=409)
        if json_username != username:
            if User.objects.filter(username=json_username).exists():
                return JsonResponse({"error": "Ese nombre de usuario ya está en uso"}, status=409)
        try:
            user = User.objects.get(username=username, archived=False)
        except User.DoesNotExist:
            return JsonResponse({"error": "El usuario que quieres editar no existe"}, status=404)
        user.username = json_username
        user.name = json_name
        user.surname = json_surname
        if json_password is not None:
            user.encrypted_password = bcrypt.hashpw(json_password.encode('utf8'), bcrypt.gensalt()).decode('utf8')
        user.save()
        return JsonResponse({"success": True}, status=201)
    elif request.method == "DELETE":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        try:
            user = User.objects.get(username=username, archived=False)
        except User.DoesNotExist:
            return JsonResponse({"error": "El usuario que quieres eliminar no existe"}, status=404)
        user.archived = True
        user.save()
        UserSession.objects.filter(user=user).delete()
        return JsonResponse({"success": True}, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def create_group(request):
    if request.method == "POST":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_tag = body_json.get("tag")
        json_name = body_json.get("name")
        json_year = body_json.get("year")
        json_tutor_username = body_json.get("tutor_username")
        if json_tag is None or json_name is None or json_tutor_username is None or json_year is None:
            return JsonResponse({"error": "Falta tag, name, year o tutor_username en el cuerpo de la petición"}, status=400)
        if not(re.match("^[A-Za-z0-9]+$", json_tag)):
            return JsonResponse({"error": "El tag no es válido. Sólo puede contener letras y dígitos"}, status=409)
        if not(re.match("^[0-9-]+$", json_year)):
            return JsonResponse({"error": "Año inválido. Sólo puede contener dígitos y guiones"}, status=409)
        if Group.objects.filter(tag=json_tag, year=json_year).exists():
            return JsonResponse({"error": "Ese grupo ya está registrado"}, status=409)
        if not User.objects.filter(username=json_tutor_username, archived=False).exists():
            return JsonResponse({"error": "El tutor indicado no existe"}, status=409)
        new_group = Group()
        new_group.tag = json_tag
        new_group.name = json_name
        new_group.year = json_year
        # Here we assume that json_tutor_username is a valid and correct teacher,
        # because it's chosen from a preloaded HTML <select> with the teachers
        new_group.tutor = User.objects.get(username=json_tutor_username)
        new_group.save()
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def get_all_classes(request):
    if request.method == "GET":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        classes = Class.objects.filter(archived=False)
        return JsonResponse({"classes": classes_array_to_json(classes) })
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def get_teachers(request):
    if request.method == "GET":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        users = User.objects.filter(Q(role=User.UserRole.TEACHER) | Q(role=User.UserRole.TEACHER_SYSADMIN) | Q(role=User.UserRole.TEACHER_LEADER)).filter(archived=False)
        return JsonResponse({"teachers": users_array_to_json(users) })
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def __admin_auth_json_error_response(request):
    if request.session.user is None:
        return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
    if request.session.user.role not in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
        return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
    return None
