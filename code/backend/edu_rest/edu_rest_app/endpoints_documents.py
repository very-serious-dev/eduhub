import json
from django.http import JsonResponse
from .models import Document, Folder
from .serializers import documents_array_to_json, folders_array_to_json, folder_to_json

def handle_documents(request):
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_files = body_json.get("files")
        json_parent_folder_id = body_json.get("parent_folder_id")
        parent_folder = None
        if json_parent_folder_id is not None:
            try:
                parent_folder = Folder.objects.get(author=request.session.user, id=json_parent_folder_id)
            except Folder.DoesNotExist:
                return JsonResponse({"error": "La carpeta que has indicado no existe"}, status=404)
        response_documents_created = []
        for f in json_files:
            document = Document()
            document.identifier = f["identifier"]
            document.name = f["name"]
            document.size = f["size"]
            document.mime_type = f["mime_type"]
            document.author = request.session.user
            document.folder = parent_folder
            document.save()
            response_documents_created.append(document)
        # TODO: Add UNIQUE constraint to document name + parent folder id? (In that case, what about documents attached to posts?)
        # REMINDER: Right now you can't have sibling folders with the same name... But you can have same-name sibling documents!
        return JsonResponse({"success": True,
                                "result": {
                                "operation": "documents_added",
                                "documents": documents_array_to_json(response_documents_created)
                                }}, status=201)
    elif request.method == "GET":
        if request.session is None: # FIX-ME: So much CTRL+C CTRL+V :(
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


