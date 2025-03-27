import json
from django.http import JsonResponse
from .models import Document, Folder, User, UserDocumentPermission, UserFolderPermission
from .serializers import documents_array_to_json, folders_array_to_json, document_to_json, folder_to_json, users_array_to_json

def get_documents_and_folders(request):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        documents = Document.objects.filter(author=request.session.user)
        folders = Folder.objects.filter(author=request.session.user)
        return JsonResponse({"documents": documents_array_to_json(documents),
                             "folders": folders_array_to_json(folders) })
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def create_folder(request):
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_name = body_json.get("name")
        json_parent_folder_id = body_json.get("parent_folder_id")
        if json_name is None:
            return JsonResponse({"error": "No has especificado name"}, status=400)
        parent_folder = None
        if json_parent_folder_id is not None:
            try:
                parent_folder = Folder.objects.get(id=json_parent_folder_id, author=request.session.user)
            except Folder.DoesNotExist:
                return JsonResponse({"error": "La carpeta padre especificada no existe"}, status=404)
        n_folders = Folder.objects.filter(author=request.session.user).count()
        max_folders = request.session.user.max_folders
        if n_folders + 1 > max_folders:
            return JsonResponse({"error": "No puedes crear más carpetas"}, status=409)
        try:
            already_existing_folder = Folder.objects.get(name=json_name, parent_folder=parent_folder)
            return JsonResponse({"error": "Ya existe una carpeta con ese nombre en ese sitio"}, status=409)
        except Folder.DoesNotExist:
            new_folder = Folder()
            new_folder.author = request.session.user
            new_folder.name = json_name
            new_folder.parent_folder = parent_folder
            new_folder.save()
            return JsonResponse({"success": True,
                                 "result": {
                                    "operation": "folder_added",
                                    "folder": folder_to_json(new_folder)
                                 }}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def move_document(request, document_identifier):
    if request.method == "PUT":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            document = Document.objects.get(identifier=document_identifier, author=request.session.user)
        except Document.DoesNotExist:
            return JsonResponse({"error": "El documento especificado no existe"}, status=404)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_folder_id = body_json.get("folder_id")
        if json_folder_id is None:
            return JsonResponse({"error": "Falta folder_id"}, status=400)
        try:
            folder = Folder.objects.get(id=json_folder_id, author=request.session.user)
        except Folder.DoesNotExist:
            return JsonResponse({"error": "La carpeta especificada no existe"}, status=404)
        document.folder = folder
        document.save()
        return JsonResponse({"success": True,
                                "result": {
                                    "operation": "document_changed",
                                    "document": document_to_json(document)
                                }}, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def move_folder(request, folder_id):
    if request.method == "PUT":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            folder = Folder.objects.get(id=folder_id, author=request.session.user)
        except Folder.DoesNotExist:
            return JsonResponse({"error": "La carpeta especificada no existe"}, status=404)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_parent_folder_id = body_json.get("parent_folder_id")
        parent_folder = None
        if json_parent_folder_id is not None:
            try:
                parent_folder = Folder.objects.get(id=json_parent_folder_id, author=request.session.user)
            except Folder.DoesNotExist:
                return JsonResponse({"error": "La carpeta padre especificada no existe"}, status=404)
        folder.parent_folder = parent_folder
        folder.save()
        return JsonResponse({"success": True,
                                "result": {
                                    "operation": "folder_changed",
                                    "folder": folder_to_json(folder)
                                }}, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def handle_document_permissions(request, document_identifier):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            document = Document.objects.get(identifier=document_identifier)
        except Document.DoesNotExist:
            return JsonResponse({"error": "El documento especificado no existe"}, status=404)
        granted_users = UserDocumentPermission.objects.filter(document=document)
        user_belongs_to_document = False
        if document.author == request.session.user:
            user_belongs_to_document = True
        else:
            for u in granted_users:
                if u.id == request.session.user.id:
                    user_belongs_to_document = True
                    break
        if not user_belongs_to_document:
            return JsonResponse({"error": "No tienes permisos para realizar esta consulta"}, status=403)
        users = list(map(lambda udp: udp.user, granted_users))
        return JsonResponse({"success": True, "users": users_array_to_json(users) }, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def handle_folder_permissions(request, folder_id):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            folder = Folder.objects.get(id=folder_id)
        except Folder.DoesNotExist:
            return JsonResponse({"error": "La carpeta especificada no existe"}, status=404)
        granted_users = UserFolderPermission.objects.filter(folder=folder)
        user_belongs_to_folder = False
        if folder.author == request.session.user:
            user_belongs_to_folder = True
        else:
            for u in granted_users:
                if u.id == request.session.user.id:
                    user_belongs_to_folder = True
                    break
        if not user_belongs_to_folder:
            return JsonResponse({"error": "No tienes permisos para realizar esta consulta"}, status=403)
        users = list(map(lambda ufp: ufp.user, granted_users))
        return JsonResponse({"success": True, "users": users_array_to_json(users) }, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
