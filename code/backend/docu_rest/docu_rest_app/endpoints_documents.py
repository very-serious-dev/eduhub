import base64, json, secrets
from django.db.models import Q
from django.db.models import Sum
from django.http import JsonResponse, HttpResponse
from .models import Document

def create_or_delete_documents(request):
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "No autenticado"}, status=401)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_files = body_json.get("files")
        if json_files is None:
            return JsonResponse({"error": "Falta files en el cuerpo de la petición"}, status=400)
        response_files = []
        for f in json_files:
            decoded_file = base64.b64decode(f["data"])
            total_docs = Document.objects.filter(author_uid=request.session.user_id).count()
            docs_size_query = Document.objects.filter(author_uid=request.session.user_id).aggregate(Sum("size"))
            # TODO: Make these checks rollback - safe (so that EduRest backend isn't inconsistent
            # if this happens)
            if total_docs + 1 > request.session.max_docs:
                return JsonResponse({"error": "Límite de documentos excedido"}, status=409)
            if (docs_size_query.get('size__sum') or 0) + len(decoded_file) > request.session.max_docs_size:
                return JsonResponse({"error": "Límite de almacenamiento excedido"}, status=409)
            identifier = secrets.token_hex(20)
            document = Document()
            document.data = decoded_file
            document.name = f["name"]
            document.identifier = identifier
            document.mime_type = f["mime_type"]
            document.size = len(decoded_file)
            document.author_uid = request.session.user_id
            document.save()
            response_files.append({"name": f["name"], "mime_type": f["mime_type"], "identifier": identifier, "size": f["size"]})
        return JsonResponse({"success": True, "uploaded_files": response_files})
    elif request.method == "DELETE":
        if request.session is None:
            return JsonResponse({"error": "No autenticado"}, status=401)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_ids = body_json.get("ids")
        if json_ids is None:
            return JsonResponse({"error": "Falta ids en el cuerpo de la petición"}, status=400)
        query = Q()
        for identifier in json_ids:
            query |= Q(identifier=identifier)
        Document.objects.filter(author_uid=request.session.user_id).filter(query).delete()
        return JsonResponse({"success": True})
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
        
def get_document(request, identifier):
    # TO-DO: Right now all documents are public to everyone
    # Implement visibility and privileges!
    if request.method == "GET":
        try:
            document = Document.objects.get(identifier=identifier)
        except Document.DoesNotExist:
            return JsonResponse({"error": "Ese documento no existe"}, status=404) # NICE-TO-HAVE: More user friendly response
        response = HttpResponse(document.data, content_type=document.mime_type)
        response["Content-Disposition"] = "filename=" + document.name;
        response["Last-Modified"] = document.created_at; # TO-DO: Browser is currently not sending If-Modified-Since. Check why and implement 304 response
        response["Cache-Control"] = "private, max-age=604800"
        return response
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
        
