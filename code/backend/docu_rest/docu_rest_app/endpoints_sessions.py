import json, requests, secrets
from django.http import JsonResponse
from .middleware_auth import AUTH_COOKIE_KEY
from .models import UserSession
from .admin_secret import ADMIN_SECRET

EDU_REST_BASE_URL = "http://localhost:8000"
EDU_REST_VERIFY_SESSION_ENDPOINT = "/api/v1/admin/sessions"

def login(request):
    if request.method == "POST":
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_one_time_token = body_json.get("one_time_token")
        if json_one_time_token is None:
            return JsonResponse({"error": "Falta one_time_token en el cuerpo de la petición"}, status=400)
        verify_identity_request_body = { "admin_secret": ADMIN_SECRET, "one_time_token": json_one_time_token }
        edu_rest_response = requests.post(EDU_REST_BASE_URL + EDU_REST_VERIFY_SESSION_ENDPOINT, json=verify_identity_request_body)
        if edu_rest_response.status_code != 200:
            return JsonResponse({"error": "Error verificando identidad"}, status=502)
        try:
            edu_rest_json_response = edu_rest_response.json()
            json_edu_rest_user_id = edu_rest_json_response["user_id"]
        except (requests.JSONDecodeError, KeyError):
            return JsonResponse({"error": "Error verificando identidad"}, status=502)
        # Let's create a new session
        random_token = secrets.token_hex(20)
        session = UserSession()
        session.user_id = json_edu_rest_user_id
        session.token = random_token
        session.save()
        response = JsonResponse({"success": True}, status=201)
        response.set_cookie(key=AUTH_COOKIE_KEY, value=random_token, path="/", samesite="Strict", httponly=True) # TO-DO: Should be secure=True too when using HTTPS
        return response
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
