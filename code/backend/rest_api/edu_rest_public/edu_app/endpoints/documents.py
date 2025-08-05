from django.http import JsonResponse
from ..models import Document, Folder, User, UserDocumentPermission, UserFolderPermission, Questionnaire, UserQuestionnairePermission, PostDocument, AnnouncementDocument, AssignmentSubmitDocument, PostQuestionnaire, AnnouncementQuestionnaire
from ..util.exceptions import ConflictQuotaExceeded, ConflictFolderAlreadyExists, Forbidden
from ..util.helpers import get_from_db
from ..util.serializers import documents_array_to_json, folders_array_to_json, document_to_json, folder_to_json, users_array_to_json, questionnaires_array_to_json, questionnaire_to_json

def get_my_files(request, only_my_files):
    my_documents = Document.objects.filter(author=request.session.user)
    my_folders = Folder.objects.filter(author=request.session.user)
    my_questionnaires = Questionnaire.objects.filter(author=request.session.user, archived=False)
    published_documents_ids = __get_published_document_ids(my_documents)
    published_questionnaires_ids = __get_published_questionnaires_ids(my_questionnaires)
    response = { "my_files": {
                     "documents": documents_array_to_json(my_documents, annotate_as_protected=published_documents_ids),
                     "folders": folders_array_to_json(my_folders),
                     "questionnaires": questionnaires_array_to_json(my_questionnaires, annotate_as_protected=published_questionnaires_ids) }}
    if not only_my_files:
        user_document_permissions = UserDocumentPermission.objects.filter(user=request.session.user)
        user_folder_permissions = UserFolderPermission.objects.filter(user=request.session.user)
        user_questionnaire_permissions = UserQuestionnairePermission.objects.filter(user=request.session.user, questionnaire__archived=False)
        # TODO: I think these lambda stuff hit database several times. It could be improved using values_list or something similar
        shared_with_me_documents = list(map(lambda udp: udp.document, user_document_permissions))
        shared_with_me_folders = list(map(lambda ufp: ufp.folder, user_folder_permissions))
        shared_with_me_questionnaires = list(map(lambda uqp: uqp.questionnaire, user_questionnaire_permissions))
        response["shared_with_me"] = {
                             "documents": documents_array_to_json(shared_with_me_documents),
                             "folders": folders_array_to_json(shared_with_me_folders),
                             "questionnaires": questionnaires_array_to_json(shared_with_me_questionnaires) }
    return JsonResponse(response, status=200)

def create_folder(request, name, parent_folder_id):
    parent_folder = get_from_db(Folder, id=parent_folder_id, author=request.session.user) if parent_folder_id else None
    n_folders = Folder.objects.filter(author=request.session.user).count()
    max_folders = request.session.user.max_folders
    if n_folders + 1 > max_folders:
        raise ConflictQuotaExceeded
    if Folder.objects.filter(name=name, parent_folder=parent_folder).exists():
        raise ConflictFolderAlreadyExists
    new_folder = Folder()
    new_folder.author = request.session.user
    new_folder.name = name
    new_folder.parent_folder = parent_folder
    new_folder.save()
    # Also grant access to users who were allowed in the destination folder
    if parent_folder:
        parent_folder_granted_users = list(map(lambda ufp: ufp.user, UserFolderPermission.objects.filter(folder=parent_folder, user__archived=False)))
        for u in parent_folder_granted_users:
            ufp = UserFolderPermission()
            ufp.user = u
            ufp.folder = new_folder
            ufp.save()
    return JsonResponse({"success": True,
                         "result": {
                             "operation": "folder_added",
                             "folder": folder_to_json(new_folder)
                         }}, status=201)

def move_document(request, d_id, folder_id):
    folder = get_from_db(Folder, id=folder_id, author=request.session.user) if folder_id else None
    document = get_from_db(Document, identifier=d_id, author=request.session.user)
    document.folder = folder
    document.save()
    # Also grant access to users who were allowed in the destination folder
    if folder:
        folder_granted_users = list(map(lambda ufp: ufp.user, UserFolderPermission.objects.filter(folder=folder, user__archived=False)))
        for u in folder_granted_users:
            UserDocumentPermission.objects.get_or_create(user=u, document=document)
    return JsonResponse({"success": True,
                            "result": {
                                "operation": "document_changed",
                                "keep_old_is_protected": True,
                                "document": document_to_json(document)
                            }}, status=200)

def move_questionnaire(request, q_id, folder_id):
    folder = get_from_db(Folder, id=folder_id, author=request.session.user) if folder_id else None
    questionnaire = get_from_db(Questionnaire, id=q_id, author=request.session.user)
    questionnaire.folder = folder
    questionnaire.save()
    # Also grant access to users who were allowed in the destination folder
    if folder:
        folder_granted_users = list(map(lambda ufp: ufp.user, UserFolderPermission.objects.filter(folder=folder, user__archived=False)))
        for u in folder_granted_users:
            UserQuestionnairePermission.objects.get_or_create(user=u, questionnaire = questionnaire)
    return JsonResponse({"success": True,
                            "result": {
                                "operation": "questionnaire_changed",
                                "keep_old_is_protected": True,
                                "questionnaire": questionnaire_to_json(questionnaire)
                            }}, status=200)

def move_folder(request, f_id, parent_folder_id, subtree_folder_ids, subtree_document_ids, subtree_questionnaire_ids):
    folder = get_from_db(Folder, id=f_id, author=request.session.user)
    parent_folder = get_from_db(Folder, id=parent_folder_id, author=request.session.user) if parent_folder_id else None
    folder.parent_folder = parent_folder
    folder.save()
    # Also grant access (to all subtree) to users who were allowed in the destination folder
    if parent_folder:
        parent_folder_granted_users = list(map(lambda ufp: ufp.user, UserFolderPermission.objects.filter(folder=parent_folder, user__archived=False)))
        for u in parent_folder_granted_users:
            for folder_id in subtree_folder_ids:
                try:
                    folder = Folder.objects.get(id=folder_id, author=request.session.user)
                    UserFolderPermission.objects.get_or_create(user=u, folder=folder)
                except Folder.DoesNotExist:
                    pass
            for document_id in subtree_document_ids:
                try:
                    document = Document.objects.get(identifier=document_id, author=request.session.user)
                    UserDocumentPermission.objects.get_or_create(user=u, document=document)
                except Document.DoesNotExist:
                    pass
            for questionnaire_id in subtree_questionnaire_ids:
                try:
                    questionnaire = Questionnaire.objects.get(id=questionnaire_id, author=request.session.user)
                    UserQuestionnairePermission.objects.get_or_create(user=u, questionnaire=questionnaire)
                except Questionnaire.DoesNotExist:
                    pass
    return JsonResponse({"success": True,
                            "result": {
                                "operation": "folder_changed",
                                "folder": folder_to_json(folder)
                            }}, status=200)

def get_document_users(request, d_id):
    document = get_from_db(Document, identifier=d_id)
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
        raise Forbidden
    users = list(map(lambda udp: udp.user, granted_users))
    return JsonResponse({"success": True, "users": users_array_to_json(users)}, status=200)

def get_folder_users(request, folder_id):
    folder = get_from_db(Folder, id=folder_id)
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
        raise Forbidden
    users = list(map(lambda ufp: ufp.user, granted_users))
    return JsonResponse({"success": True, "users": users_array_to_json(users)}, status=200)

def get_questionnaire_users(request, q_id):
    questionnaire = get_from_db(Questionnaire, id=q_id)
    granted_users = UserQuestionnairePermission.objects.filter(questionnaire=questionnaire, user__archived=False)
    user_belongs_to_questionnaire = False
    if questionnaire.author == request.session.user:
        user_belongs_to_questionnaire = True
    else:
        for u in granted_users:
            if u.id == request.session.user.id:
                user_belongs_to_questionnaire = True
                break
    if not user_belongs_to_questionnaire:
        raise Forbidden
    users = list(map(lambda uqp: uqp.user, granted_users))
    return JsonResponse({"success": True, "users": users_array_to_json(users)}, status=200)

def grant_permission(request, document_ids, folder_ids, questionnaire_ids, usernames):
    failed_inexistent_users = []
    users = []
    for username in usernames:
        try:
            user = User.objects.get(username=username, archived=False)
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
    for questionnaire_id in questionnaire_ids:
        try:
            questionnaire = Questionnaire.objects.get(id=questionnaire_id, author=request.session.user)
            for u in users:
                if UserQuestionnairePermission.objects.filter(user=u, questionnaire=questionnaire).exists():
                    failed_already_added_users.append(u.username)
                else:
                    new_uqp = UserQuestionnairePermission()
                    new_uqp.user = u
                    new_uqp.questionnaire = questionnaire
                    new_uqp.save()
        except Questionnaire.DoesNotExist:
            failed_forbidden_or_inexistent_files.append("q" + str(questionnaire_id))
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

def remove_permission(request, document_ids, folder_ids, questionnaire_ids, username):
    user = get_from_db(User, username=username)
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
    for questionnaire_id in questionnaire_ids:
        try:
            questionnaire = Questionnaire.objects.get(id=questionnaire_id, author=request.session.user)
            UserQuestionnairePermission.objects.filter(user=user, questionnaire=questionnaire).delete()
        except Questionnaire.DoesNotExist:
            pass
    return JsonResponse({"success": True}, status=200)

def __get_published_document_ids(documents):
    posted_documents = PostDocument.objects.filter(document__in=documents).values_list("document_id", flat=True).distinct()
    announced_documents = AnnouncementDocument.objects.filter(document__in=documents).values_list("document_id", flat=True).distinct()
    submitted_documents = AssignmentSubmitDocument.objects.filter(document__in=documents).values_list("document_id", flat=True).distinct()
    published_documents_ids = set()
    for document_id in list(posted_documents) + list(announced_documents) + list(submitted_documents):
        published_documents_ids.add(document_id)
    return published_documents_ids

def __get_published_questionnaires_ids(questionnaires):
    posted_questionnaires = PostQuestionnaire.objects.filter(questionnaire__in=questionnaires).values_list("questionnaire_id", flat=True).distinct()
    announced_questionnaires = AnnouncementQuestionnaire.objects.filter(questionnaire__in=questionnaires).values_list("questionnaire_id", flat=True).distinct()
    published_questionnaires_ids = set()
    for questionnaire_id in list(posted_questionnaires) + list(announced_questionnaires):
        published_questionnaires_ids.add(questionnaire_id)
    return published_questionnaires_ids
