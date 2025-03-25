import json
from django.http import JsonResponse
from .models import EduAppUsersession
from .internal_secret import INTERNAL_SECRET

def verify_session(request): # See docs/auth_flow.txt for further information
    if request.method == "POST":
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_internal_secret = body_json.get("internal_secret")
        json_one_time_token = body_json.get("one_time_token")
        if json_internal_secret is None or json_one_time_token is None:
            return JsonResponse({"error": "Error"}, status=400)
        if json_internal_secret != INTERNAL_SECRET:
            return JsonResponse({"error": "Error"}, status=400)
        try:
            user_session = EduAppUsersession.objects.get(one_time_token=json_one_time_token)
        except EduAppUsersession.DoesNotExist:
            return JsonResponse({"error": "Error"}, status=400)
        if user_session.one_time_token_already_used == True:
            # TODO: Implement an actual log system
            print("[SEVERE] Security warning: The one_time_token " + json_one_time_token)
            print("has been used twice in /admin/sessions. This should never happen in a regular")
            print("authentication flow. Someone might be trying to do something naughty")
            user_session.delete()
            return JsonResponse({"error": "Error"}, status=400)
        user_session.one_time_token_already_used = True
        user_session.save()
        return JsonResponse({"user_id": user_session.user.id,
                             "max_folders_allowed": user_session.user.max_folders,
                             "max_documents_allowed": user_session.user.max_documents,
                             "max_bytes_allowed": user_session.user.max_documents_size })
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
