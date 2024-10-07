import bcrypt, json, secrets
from django.http import JsonResponse
from .middleware_auth import AUTH_COOKIE_KEY
from .models import EPUser, EPUserSession, EPTeacher, STUDENT

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
            try:
			    db_teacher = EPTeacher(user=db_user)
			    roles = db_teacher.roles_array()
			except EPTeacher.DoesNotExist:
				# Let's assume we're handling a student
				roles = [STUDENT]
            response = JsonResponse({"success": True, "user_roles": roles}, status=201)
            response["Set-Cookie"] = AUTH_COOKIE_KEY + "=" + random_token + "; SameSite=Strict; HttpOnly; Path=/"
            return response
        else:
            return JsonResponse({"error": "Contraseña incorrecta"}, status=401)    
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)


