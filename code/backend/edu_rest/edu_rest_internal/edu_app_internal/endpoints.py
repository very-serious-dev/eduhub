import json
from datetime import datetime
from django.http import JsonResponse
from .models import EduAppUsersession, EduAppUser, EduAppDocument, EduAppFolder, EduAppPostdocument, EduAppUserclass, EduAppAssignmentsubmitdocument, EduAppUserdocumentpermission
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
        return JsonResponse({"user_id": user_session.user.id })
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def create_or_delete_documents(request):
    if request.method == "POST":
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_internal_secret = body_json.get("internal_secret")
        json_documents = body_json.get("documents")
        json_user_id = body_json.get("user_id")
        json_current_quota_usage = body_json.get("current_quota_usage")
        json_parent_folder_id = body_json.get("parent_folder_id")
        json_skip_saving_files=body_json.get("skip_saving_files")
        if json_internal_secret is None or json_documents is None or json_user_id is None or json_current_quota_usage is None or json_skip_saving_files is None:
            return JsonResponse({"error": "Error"}, status=400)
        if json_internal_secret != INTERNAL_SECRET:
            return JsonResponse({"error": "Error"}, status=400)
        try:
            user = EduAppUser.objects.get(id=json_user_id)
        except EduAppUser.DoesNotExist:
            return JsonResponse({"error": "Error"}, status=400)
        # Max storage capacity checks
        current_n_docs = EduAppDocument.objects.filter(author=user).count()
        if current_n_docs + len(json_documents) > user.max_documents:
            return JsonResponse({"error": "Subir " + len(json_files) +" documentos más rebasa tu capacidad de almacenamiento"}, status=409)
        total_new_files_size = 0
        for d in json_documents:
            total_new_files_size += d["size"]
        if json_current_quota_usage + total_new_files_size > user.max_documents_size:
            return JsonResponse({"error": "Subir esos documentos rebasa tu capacidad de almacenamiento"}, status=409)
        # Proceed
        if not json_skip_saving_files:
            try:
                parent_folder = EduAppFolder.objects.get(author=user, id=json_parent_folder_id)
            except EduAppFolder.DoesNotExist:
                return JsonResponse({"error": "La carpeta que has indicado no existe"}, status=404)
            for d in json_documents:
                # TODO: Add UNIQUE constraint to document name + parent folder id?
                # (In that case, what about documents attached to posts?)
                # REMINDER: Right now you can't have sibling folders with the same name...
                # But you can have same-name sibling documents!
                document = EduAppDocument()
                document.identifier = d["identifier"]
                document.name = d["name"]
                document.size = d["size"]
                document.mime_type = d["mime_type"]
                document.is_protected = False
                document.author = user
                document.folder = parent_folder
                document.created_at = datetime.today()
                document.save()
        return JsonResponse({"success": True})
    elif request.method == "DELETE":
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_internal_secret = body_json.get("internal_secret")
        json_document_ids = body_json.get("document_ids")
        json_folder_ids = body_json.get("folder_ids")
        json_user_id = body_json.get("user_id")
        if json_internal_secret is None or json_document_ids is None or json_folder_ids is None or json_user_id is None:
            return JsonResponse({"error": "Error"}, status=400)
        if json_internal_secret != INTERNAL_SECRET:
            return JsonResponse({"error": "Error"}, status=400)
        try:
            user = EduAppUser.objects.get(id=json_user_id)
        except EduAppUser.DoesNotExist:
            return JsonResponse({"error": "Error"}, status=400)
        deleted_document_ids = []
        deleted_folder_ids = []
        for did in json_document_ids:
            try:
                document = EduAppDocument.objects.get(identifier=did, author=user)
                if not document.is_protected:
                    document.delete()
                    deleted_document_ids.append(did)
            except EduAppDocument.DoesNotExist:
                pass
        for fid in json_folder_ids:
            try:
                folder = EduAppFolder.objects.get(id=fid, author=user)
                if not folder.is_autogenerated:
                    folder.delete()
                    deleted_folder_ids.append(fid)
            except EduAppFolder.DoesNotExist:
                pass
        return JsonResponse({"success": True, "deleted_folder_ids": deleted_folder_ids, "deleted_document_ids": deleted_document_ids })
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def document_permissions(request):
    if request.method == "GET":
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_internal_secret = body_json.get("internal_secret")
        json_user_id = body_json.get("user_id")
        document_identifier = request.GET.get("identifier")
        if json_internal_secret is None or json_user_id is None or document_identifier is None:
            return JsonResponse({"error": "Error"}, status=400)
        if json_internal_secret != INTERNAL_SECRET:
            return JsonResponse({"error": "Error"}, status=400)
        try:
            user = EduAppUser.objects.get(id=json_user_id)
        except EduAppUser.DoesNotExist:
            return JsonResponse({"error": "Error"}, status=400)
        try:
            document = EduAppDocument.objects.get(identifier=document_identifier)
        except EduAppDocument.DoesNotExist:
            return JsonResponse({"error": "Error"}, status=400)
        if document.author == user:
            return JsonResponse({"success": True}, status=200)
        else:
            for pd in EduAppPostdocument.objects.filter(document=document):
                post_class = pd.post.classroom
                if EduAppUserclass.objects.filter(classroom=post_class, user=user).exists():
                    return JsonResponse({"success": True}, status=200)
                # TO-DO: return 403 if the post was amended (deleted/edited)
            if is_teacher(user.role):
                for asd in EduAppAssignmentsubmitdocument.objects.filter(document=document):
                    assignment_class = asd.submit.assignment.classroom
                    if EduAppUserclass.objects.filter(classroom=assignment_class, user=user).exists():
                        return JsonResponse({"success": True}, status=200)
                    # TO-DO: return 403 if the post was amended (deleted/edited
            if EduAppUserdocumentpermission.objects.filter(document=document, user=user).exists():
                return JsonResponse({"success": True}, status=200)
            return JsonResponse({"error": "Forbidden"}, status=403)

def is_teacher(role):
    # To figure this out, go check EduREST public API models.py User.UserRole
    return role == 1 or role == 2 or role == 3
