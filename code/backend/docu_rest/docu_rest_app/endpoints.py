import base64, json, requests, secrets, socket
import requests.packages.urllib3.util.connection as urllib3_cn
from django.db.models import Q
from django.db.models import Sum
from django.http import JsonResponse, HttpResponse
from .middleware_auth import AUTH_COOKIE_KEY
from .models import UserSession, Document
from .internal_secret import INTERNAL_SECRET

# Force IPv4 on requests library to improve connection speed
# https://stackoverflow.com/a/46972341
def allowed_gai_family_override():
    return socket.AF_INET
urllib3_cn.allowed_gai_family = allowed_gai_family_override


EDU_REST_INTERNAL_BASE_URL         = "http://localhost:8002"
VERIFY_SESSION_ENDPOINT            = "/internal/v1/sessions"
CREATE_DELETE_DOCUMENTS_ENDPOINT   = "/internal/v1/documents"
DOCUMENTS_PERMISSIONS_ENDPOINT     = "/internal/v1/documents/permissions"

def login_logout(request):
    if request.method == "POST":
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_one_time_token = body_json.get("one_time_token")
        if json_one_time_token is None:
            return JsonResponse({"error": "Falta one_time_token en el cuerpo de la petición"}, status=400)
        verify_identity_request_body = { "internal_secret": INTERNAL_SECRET, "one_time_token": json_one_time_token }
        edu_rest_response = requests.post(EDU_REST_INTERNAL_BASE_URL + VERIFY_SESSION_ENDPOINT, json=verify_identity_request_body)
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
    elif request.method == "DELETE":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        request.session.delete()
        return JsonResponse({"success": True}, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)


def create_or_delete_documents(request): # TODO: Fix django.core.exceptions.RequestDataTooBig: Request body exceeded settings.DATA_UPLOAD_MAX_MEMORY_SIZE. for big files
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "No autenticado"}, status=401)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_filetree_info = body_json.get("filetree_info")
        json_files = body_json.get("files")
        if json_files is None or json_filetree_info is None:
            return JsonResponse({"error": "Falta files en el cuerpo de la petición"}, status=400)
        json_must_internally_register_in_edu_rest = json_filetree_info.get("must_save_to_filetree", False)
        json_parent_folder_id = json_filetree_info.get("parent_folder_id")
        # Calculate currently usaged quota
        total_docs = Document.objects.filter(author_uid=request.session.user_id).count()
        docs_size_query = Document.objects.filter(author_uid=request.session.user_id).aggregate(Sum("size"))
        current_quota_usage = docs_size_query.get('size__sum') or 0

        unsaved_files = []
        edu_json_request_files = [] # unused if must_save_to_filetree is False
        for f in json_files:
            decoded_file = base64.b64decode(f["data"])
            identifier = secrets.token_hex(20)
            document = Document()
            document.data = decoded_file
            document.name = f["name"]
            document.identifier = identifier
            document.mime_type = f["mime_type"]
            document.size = len(decoded_file)
            document.author_uid = request.session.user_id
            document.save()
            unsaved_files.append(document)
            edu_json_request_files.append({ "identifier": document.identifier,
                                            "name": document.name,
                                            "size": document.size,
                                            "mime_type": document.mime_type })
        edu_rest_json_body = { "internal_secret": INTERNAL_SECRET,
                               "user_id": request.session.user_id,
                               "current_quota_usage": current_quota_usage,
                               "parent_folder_id": json_parent_folder_id,
                                # If skip_saving_files is True, then internal EduREST API request
                                # is only needed to check quota usage
                               "skip_saving_files": not json_must_internally_register_in_edu_rest,
                               "documents": edu_json_request_files }
        edu_rest_response = requests.post(EDU_REST_INTERNAL_BASE_URL + CREATE_DELETE_DOCUMENTS_ENDPOINT, json=edu_rest_json_body)
        if edu_rest_response.status_code == 409:
            # Forward 409 errors to React client (they're about exceeding allowed storage)
            return JsonResponse({"error": json.loads(edu_rest_response.body)["error"]}, status=409)
        elif edu_rest_response.status_code != 200:
            return JsonResponse({"error": "Error subiendo ficheros"}, status=502)
        # EduREST internal request was 200 OK

        response_documents_created = []
        for ud in unsaved_files:
            ud.save()
            created_document = {
                "identifier": ud.identifier,
                "name": ud.name,
                "size": ud.size,
                "is_protected": False,
                "mime_type": ud.mime_type
            }
            if json_parent_folder_id is not None:
                created_document["folder_id"] = json_parent_folder_id
            response_documents_created.append(created_document)
        return JsonResponse({"success": True,
                             "result": {
                                 "operation": "documents_added",
                                 "documents": response_documents_created
                             }}, status=201)
                                 
    elif request.method == "DELETE":
        if request.session is None:
            return JsonResponse({"error": "No autenticado"}, status=401)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_document_ids = body_json.get("document_ids")
        json_folder_ids = body_json.get("folder_ids")
        if json_document_ids is None or json_folder_ids is None:
            return JsonResponse({"error": "Error"}, status=400)
        edu_rest_json_body = { "internal_secret": INTERNAL_SECRET,
                               "user_id": request.session.user_id,
                               "document_ids": json_document_ids,
                               "folder_ids": json_folder_ids }

        edu_rest_response = requests.delete(EDU_REST_INTERNAL_BASE_URL + CREATE_DELETE_DOCUMENTS_ENDPOINT, json=edu_rest_json_body)
        if edu_rest_response.status_code != 200:
            return JsonResponse({"error": "Error eliminando ficheros"}, status=502)
        edu_rest_response_body = edu_rest_response.json()
        query = Q()
        for identifier in json_document_ids: #TODO Check if this is working?
            query |= Q(identifier=identifier)
        Document.objects.filter(author_uid=request.session.user_id).filter(query).delete()
        return JsonResponse({"success": True,
                             "result": {
                                 "operation": "files_deleted",
                                 "removed_documents_ids": edu_rest_response_body["deleted_document_ids"],
                                 "removed_folders_ids": edu_rest_response_body["deleted_folder_ids"]
                            }}, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
        
def get_document(request, identifier):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "No autenticado"}, status=401)
        try:
            document = Document.objects.get(identifier=identifier)
        except Document.DoesNotExist:
            return JsonResponse({"error": "Ese documento no existe"}, status=404)
        edu_rest_json_body = { "internal_secret": INTERNAL_SECRET,
                               "user_id": request.session.user_id }
        edu_rest_response = requests.get(EDU_REST_INTERNAL_BASE_URL + DOCUMENTS_PERMISSIONS_ENDPOINT + "?identifier=" + identifier, json=edu_rest_json_body)
        
        if edu_rest_response.status_code == 403:
            return JsonResponse({"error": "No tienes permisos para acceder a ese fichero"}, status=403)
        elif edu_rest_response.status_code != 200:
            return JsonResponse({"error": "Error"}, status=502)
        # EduREST internal request was 200 OK - You can see the file
        response = HttpResponse(document.data, content_type=document.mime_type)
        response["Content-Disposition"] = "filename=" + document.name;
        return response
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
        
