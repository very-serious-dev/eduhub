import bcrypt, json, secrets
from django.http import JsonResponse
from django.db.models import Q
from .middleware_auth import AUTH_COOKIE_KEY, ROLES_COOKIE_KEY, MAX_STORAGE_COOKIE_KEY, USERNAME_COOKIE_KEY
from .models import User, UserSession
from .models import TOKEN_SIZE
from .serializers import roles_array, users_array_to_json

def login_logout(request):
    if request.method == "POST":
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_username = body_json.get("username")
        json_password = body_json.get("password")
        if json_username is None or json_password is None:
            return JsonResponse({"error": "Falta username o password en el cuerpo de la petición"}, status=400)
        try:
            db_user = User.objects.get(username=json_username, archived=False)
        except User.DoesNotExist:
            return JsonResponse({"error": "El usuario no existe"}, status=404)
        # Let's create a new session
        if bcrypt.checkpw(json_password.encode('utf8'), db_user.encrypted_password.encode('utf8')):
            random_token = secrets.token_hex(TOKEN_SIZE)
            random_one_time_token = secrets.token_hex(TOKEN_SIZE)
            session = UserSession()
            session.user = db_user
            session.token = random_token
            session.one_time_token = random_one_time_token
            session.save()
            roles = roles_array(db_user)
            response = JsonResponse({"success": True, "one_time_token": random_one_time_token}, status=201)
            # https://docs.djangoproject.com/en/5.1/ref/request-response/#django.http.HttpResponse.set_cookie
            response.set_cookie(key=AUTH_COOKIE_KEY, value=random_token, path="/", samesite="Strict", httponly=True) # TO-DO: Should be secure=True too when using HTTPS
            response.set_cookie(key=ROLES_COOKIE_KEY, value='-'.join(roles), path="/", samesite="Strict")
            response.set_cookie(key=USERNAME_COOKIE_KEY, value=db_user.username, path="/", samesite="Strict")
            max_storage_cookie = str(db_user.max_folders) + "-" + str(db_user.max_documents) + "-" + str(db_user.max_documents_size)
            response.set_cookie(key=MAX_STORAGE_COOKIE_KEY, value=max_storage_cookie, path="/", samesite="Strict")
            return response
        else:
            return JsonResponse({"error": "Contraseña incorrecta"}, status=401)
    elif request.method == "DELETE":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        request.session.delete()
        return JsonResponse({"success": True}, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def get_users(request):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        if request.session.user.role not in [User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=401)
        q = request.GET.get("search", None)
        if q is None:
            users = User.objects.filter(archived=False)
        else:
            users = User.objects.filter(archived=False).filter(Q(username__icontains=q) | Q(name__icontains=q) | Q(surname__icontains=q))
        return JsonResponse({"users": users_array_to_json(users)})
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

