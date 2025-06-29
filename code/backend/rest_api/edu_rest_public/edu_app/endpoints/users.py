import bcrypt, json, secrets, datetime
from django.http import JsonResponse
from django.db.models import Q
from ..preconditions.middleware_auth import AUTH_COOKIE_KEY
from ..models import User, UserSession, FailedLoginAttempt, TOKEN_SIZE
from ..util.serializers import roles_array, users_array_to_json

MAX_FAILED_LOGINS_IN_24_HOURS = 10
PASSWORD_DAYS_TO_EXPIRE = 3 # TODO: For development purposes; change it to 4 months

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
        yesterday = datetime.date.today() - datetime.timedelta(days=1)
        if FailedLoginAttempt.objects.filter(username=json_username, datetime__gte=yesterday).count() > MAX_FAILED_LOGINS_IN_24_HOURS:
            return JsonResponse({"error": "La cuenta está bloqueada debido a actividad sospechosa"}, status=403)
        try:
            db_user = User.objects.get(username=json_username, archived=False)
        except User.DoesNotExist:
            fla = FailedLoginAttempt()
            fla.username = json_username
            fla.client_ip = request.META.get('REMOTE_ADDR')
            fla.client_user_agent = request.META.get('HTTP_USER_AGENT')
            fla.save()
            return JsonResponse({"error": "El usuario no existe"}, status=404)
        if bcrypt.checkpw(json_password.encode('utf8'), db_user.encrypted_password.encode('utf8')):
            # Password is correct. Has the password expired, though?
            must_reset_password = db_user.last_password_change is None or datetime.datetime.now().timestamp() > (db_user.last_password_change + datetime.timedelta(days=PASSWORD_DAYS_TO_EXPIRE)).timestamp()
            if must_reset_password:
                password_reset_token = secrets.token_hex(TOKEN_SIZE) #NICE-TO-HAVE: Make this token expire after a short time (5 min)
                db_user.password_reset_token = password_reset_token
                db_user.save()
                return JsonResponse({"success": False,
                                     "reason": "Por favor, establece una nueva contraseña" if db_user.last_password_change is None else "Tu contraseña está caducada",
                                     "password_reset_token": password_reset_token})
            else:
                random_token = secrets.token_hex(TOKEN_SIZE)
                random_one_time_token = secrets.token_hex(TOKEN_SIZE)
                session = UserSession()
                session.user = db_user
                session.token = random_token
                session.one_time_token = random_one_time_token
                session.save()
                response = JsonResponse({"success": True,
                                        "one_time_token": random_one_time_token,
                                        "session_info": {
                                            "username": db_user.username,
                                            "roles": roles_array(db_user),
                                            "max_storage": {
                                                "folders": db_user.max_folders,
                                                "documents": db_user.max_documents,
                                                "bytes": db_user.max_documents_size
                                            }
                                        }}, status=201)
                response.set_cookie(key=AUTH_COOKIE_KEY, value=random_token, path="/", samesite="Strict", httponly=True) # TO-DO: Should be secure=True too when using HTTPS
                return response
        else:
            fla = FailedLoginAttempt()
            fla.username = json_username
            fla.client_ip = request.META.get('REMOTE_ADDR')
            fla.client_user_agent = request.META.get('HTTP_USER_AGENT')
            fla.save()
            return JsonResponse({"error": "Contraseña incorrecta"}, status=401)
    elif request.method == "DELETE":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        request.session.delete()
        return JsonResponse({"success": True}, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def reset_password(request):
    if request.method == "POST":
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_password_reset_token = body_json.get("password_reset_token")
        json_password = body_json.get("password")
        json_new_password = body_json.get("new_password")
        if json_password_reset_token is None or json_new_password is None or json_password is None:
            return JsonResponse({"error": "Falta password_reset_token, password o new_password en el cuerpo de la petición"}, status=400)
        if len(json_new_password) < 8:
            return JsonResponse({"error": "La contraseña debe tener por lo menos 8 caracteres"}, status=409)
        try:
            db_user = User.objects.get(password_reset_token=json_password_reset_token, archived=False)
        except User.DoesNotExist:
            return JsonResponse({"error": "Token no válido"}, status=401)
        if bcrypt.checkpw(json_password.encode('utf8'), db_user.encrypted_password.encode('utf8')):
            db_user.password_reset_token = None
            db_user.encrypted_password = bcrypt.hashpw(json_new_password.encode('utf8'), bcrypt.gensalt()).decode('utf8')
            db_user.last_password_change = datetime.datetime.now()
            db_user.save()
            return JsonResponse({"success": True})
        else:
            return JsonResponse({"error": "Tu contraseña actual no es correcta"}, status=401)

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

