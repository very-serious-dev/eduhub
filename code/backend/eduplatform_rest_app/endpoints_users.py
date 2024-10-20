import bcrypt, json, secrets
from django.http import JsonResponse
from .middleware_auth import AUTH_COOKIE_KEY, ROLES_COOKIE_KEY
from .models import EPUser, EPUserSession
from .serializers import roles_array

def handle_login(request):
    if request.method == "POST":
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_username = body_json.get("username")
        json_password = body_json.get("password")
        if json_username is None or json_password is None:
            return JsonResponse({"error": "Falta username o password en el cuerpo de la petición"}, status=400)
        try:
            db_user = EPUser.objects.get(username=json_username)
        except EPUser.DoesNotExist:
            return JsonResponse({"error": "El usuario no existe"}, status=404)
        # Let's create a new session
        if bcrypt.checkpw(json_password.encode('utf8'), db_user.encrypted_password.encode('utf8')):
            random_token = secrets.token_hex(20)
            session = EPUserSession()
            session.user = db_user
            session.token = random_token
            session.save()
            roles = roles_array(db_user)
            response = JsonResponse({"success": True}, status=201)
            # https://docs.djangoproject.com/en/5.1/ref/request-response/#django.http.HttpResponse.set_cookie
            response.set_cookie(key=AUTH_COOKIE_KEY, value=random_token, path="/", samesite="Strict", httponly=True) # TO-DO: Should be secure=True too when using HTTPS
            response.set_cookie(key=ROLES_COOKIE_KEY, value='-'.join(roles), path="/", samesite="Strict")
            return response
        else:
            return JsonResponse({"error": "Contraseña incorrecta"}, status=401)    
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)


