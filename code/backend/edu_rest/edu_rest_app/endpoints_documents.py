from django.http import JsonResponse
from .models import Document, Folder
from .serializers import documents_array_to_json, folders_array_to_json

def get_documents(request):
    if request.method == "GET":
        if request.session is None: # FIX-ME: So much CTRL+C CTRL+V :(
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        documents = Document.objects.filter(author=request.session.user)
        folders = Folder.objects.filter(author=request.session.user)
        return JsonResponse({"documents": documents_array_to_json(documents),
                             "folders": folders_array_to_json(folders) })
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

