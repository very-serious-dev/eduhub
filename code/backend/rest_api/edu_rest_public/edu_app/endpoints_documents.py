import json
from django.http import JsonResponse, QueryDict
from .models import Document, Folder, User, UserDocumentPermission, UserFolderPermission
from .serializers import documents_array_to_json, folders_array_to_json, document_to_json, folder_to_json, users_array_to_json

def get_documents_and_folders(request):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        my_documents = Document.objects.filter(author=request.session.user)
        my_folders = Folder.objects.filter(author=request.session.user)
        user_document_permissions = UserDocumentPermission.objects.filter(user=request.session.user)
        user_folder_permissions = UserFolderPermission.objects.filter(user=request.session.user)
        shared_with_me_documents = list(map(lambda udp: udp.document, user_document_permissions))
        shared_with_me_folders = list(map(lambda ufp: ufp.folder, user_folder_permissions))
        return JsonResponse({"my_files": {
                                "documents": documents_array_to_json(my_documents),
                                "folders": folders_array_to_json(my_folders) },
                             "shared_with_me": {
                                "documents": documents_array_to_json(shared_with_me_documents),
                                "folders": folders_array_to_json(shared_with_me_folders) }})
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
        folder = None
        if json_folder_id is not None:
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

def get_document_users(request, document_identifier):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            document = Document.objects.get(identifier=document_identifier)
        except Document.DoesNotExist:
            return JsonResponse({"error": "El documento especificado no existe"}, status=404)
        granted_users = UserDocumentPermission.objects.filter(document=document, user__archived=False)
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

def get_folder_users(request, folder_id):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            folder = Folder.objects.get(id=folder_id)
        except Folder.DoesNotExist:
            return JsonResponse({"error": "La carpeta especificada no existe"}, status=404)
        granted_users = UserFolderPermission.objects.filter(folder=folder, user__archived=False)
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

def update_files_users(request):
    if request.method == "PUT":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        url_query = QueryDict(request.META.get("QUERY_STRING", ""))
        url_docs = url_query.get("documentIds", None)
        url_folders = url_query.get("folderIds", None)
        document_ids = url_docs.split(",") if url_docs is not None else []
        folder_ids = url_folders.split(",") if url_folders is not None else []
        if len(document_ids) == 0 and len(folder_ids) == 0:
            return JsonResponse({"error": "No se ha especificado ningún documento o carpeta"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_username = body_json.get("username")
        if json_username is None:
            return JsonResponse({"error": "Falta username en el cuerpo de la petición"}, status=400)
        non_trimmed_usernames = json_username.split(",")
        usernames = list(map(lambda x: x.strip(), non_trimmed_usernames))
        failed_inexistent_users = []
        users = []
        for username in usernames:
            if len(username) > 0:
                try:
                    user = User.objects.get(username=username)
                    users.append(user)
                except User.DoesNotExist:
                    failed_inexistent_users.append(username)
        failed_forbidden_or_inexistent_files = []
        failed_already_added_users = []
        for document_id in document_ids:
            try:
                document = Document.objects.get(identifier=document_id, author=request.session.user)
                for u in users:
                    if UserDocumentPermission.objects.filter(user=u, document=document).exists():
                        failed_already_added_users.append(u.username)
                    else:
                        new_udp = UserDocumentPermission()
                        new_udp.user = u
                        new_udp.document = document
                        new_udp.save()
            except Document.DoesNotExist:
                failed_forbidden_or_inexistent_files.append(document_id)
        for folder_id in folder_ids:
            try:
                folder = Folder.objects.get(id=folder_id, author=request.session.user)
                for u in users:
                    if UserFolderPermission.objects.filter(user=u, folder=folder).exists():
                        failed_already_added_users.append(u.username)
                    else:
                        new_ufp = UserFolderPermission()
                        new_ufp.user = u
                        new_ufp.folder = folder
                        new_ufp.save()
            except Folder.DoesNotExist:
                failed_forbidden_or_inexistent_files.append(folder_id)
            
        if len(failed_inexistent_users) == 0 and len(failed_already_added_users) == 0 and len(failed_forbidden_or_inexistent_files) == 0:
            return JsonResponse({"success": True}, status=201)
        else:
            error_msg = ""
            if len(failed_inexistent_users) > 0:
                error_msg += "Usuario(s) inexistente(s): " + ", ".join(failed_inexistent_users) + "; "
            if len(failed_already_added_users) > 0:
                error_msg += "Usuario(s) ya tiene(n) acceso: " + ", ".join(failed_already_added_users) + "; "
            if len(failed_forbidden_or_inexistent_files) > 0:
                error_msg += "No existe(n) o no tienes permisos para fichero(s): " + ", ".join(failed_forbidden_or_inexistent_files)
            return JsonResponse({"partial_success": True, "error": error_msg}, status=201)
    elif request.method == "DELETE":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        url_query = QueryDict(request.META.get("QUERY_STRING", ""))
        url_docs = url_query.get("documentIds", None)
        url_folders = url_query.get("folderIds", None)
        document_ids = url_docs.split(",") if url_docs is not None else []
        folder_ids = url_folders.split(",") if url_folders is not None else []
        if len(document_ids) == 0 and len(folder_ids) == 0:
            return JsonResponse({"error": "No se ha especificado ningún documento o carpeta"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_username = body_json.get("username")
        if json_username is None:
            return JsonResponse({"error": "Falta username en el cuerpo de la petición"}, status=400)
        try:
            user = User.objects.get(username=json_username)
        except User.DoesNotExist:
            return JsonResponse({"error": "El usuario indicado no existe"}, status=404)
        for document_id in document_ids:
            try:
                document = Document.objects.get(identifier=document_id, author=request.session.user)
                UserDocumentPermission.objects.filter(user=user, document=document).delete()
            except Document.DoesNotExist:
                pass
        for folder_id in folder_ids:
            try:
                folder = Folder.objects.get(id=folder_id, author=request.session.user)
                UserFolderPermission.objects.filter(user=user, folder=folder).delete()
            except Folder.DoesNotExist:
                pass
        return JsonResponse({"success": True}, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
