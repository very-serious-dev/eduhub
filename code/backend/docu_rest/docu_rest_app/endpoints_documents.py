import base64, json, secrets
from django.http import JsonResponse, HttpResponse
from .models import Document

def create_document(request):
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Privilegios insuficientes"}, status=401)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_files = body_json.get("files")
        if json_files is None:
            return JsonResponse({"error": "Falta files en el cuerpo de la petición"}, status=400)
        response_files = []
        for f in json_files:
            identifier = secrets.token_hex(20)
            document = Document()
            document.data = base64.b64decode(f["data"])
            document.name = f["name"]
            document.identifier = identifier
            document.mime_type = f["mime_type"]
            document.author_uid = request.session.user_id
            document.save()
            response_files.append({"name": f["name"], "mime_type": f["mime_type"], "identifier": identifier, "size": f["size"]})
        return JsonResponse({"success": True, "uploaded_files": response_files})
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
        
def document(request, identifier):
    # TO-DO: Right now all documents are public to everyone
    # Implement visibility and privileges!
    if request.method == "GET":
        try:
            document = Document.objects.get(identifier=identifier)
        except Document.DoesNotExist:
            return JsonResponse({"error": "Ese documento no existe"}, status=404) # NICE-TO-HAVE: More user friendly response
        response = HttpResponse(document.data, content_type=document.mime_type)
        response["Content-Disposition"] = "filename=" + document.name;
        response["Last-Modified"] = document.created; # TO-DO: Browser is currently not sending If-Modified-Since. Check why and implement 304 response
        response["Cache-Control"] = "private, max-age=604800"
        return response
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
        
