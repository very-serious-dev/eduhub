import bcrypt, json, secrets
from django.http import JsonResponse
from .middleware_auth import AUTH_COOKIE_KEY
from .models import EPUser, EPUserSession

def handle_login(request):
    if request.method == "POST":
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Malformed request body"}, status=400)
        json_username = body_json.get("username")
        json_password = body_json.get("password")
        if json_username is None or json_password is None:
            return JsonResponse({"error": "Missing username or password in request body"}, status=400)
        try:
            db_user = EPUser.objects.get(username=json_username)
        except EPUser.DoesNotExist:
            return JsonResponse({"error": "Username does not exist"}, status=404)
        # Let's create a new session
        if bcrypt.checkpw(json_password.encode('utf8'), db_user.encrypted_password.encode('utf8')):
            random_token = secrets.token_hex(20)
            session = EPUserSession()
            session.user = db_user
            session.token = random_token
            session.save()
            response = JsonResponse({"success": True}, status=201)
            response["Set-Cookie"] = AUTH_COOKIE_KEY + "=" + random_token + "; SameSite=Strict; HttpOnly; Path=/"
            return response
        else:
            return JsonResponse({"error": "Invalid password"}, status=401)    
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def handle_register(request):
    if request.method == "POST":
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Malformed request body"}, status=400)
        json_username = body_json.get("username")
        json_name = body_json.get("name")
        json_surname = body_json.get("surname")
        json_password = body_json.get("password")
        if json_username is None or json_name is None or json_surname is None or json_password is None:
            return JsonResponse({"error": "Missing username, name, surname or password in request body"}, status=400)
        # TO-DO: Further validation of input params
        # TO-DO: Only logged-in admin users should be able to register new users!
        
        if EPUser.objects.filter(username=json_username).exists():
            return JsonResponse({"error": "Username already registered"}, status=409)
        # Let's save the new user
        salted_and_hashed_pass = bcrypt.hashpw(json_password.encode('utf8'), bcrypt.gensalt()).decode('utf8')
        user = EPUser()
        user.username = json_username
        user.name = json_name
        user.surname = json_surname
        user.encrypted_password = salted_and_hashed_pass
        user.save()
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)


