from django.http import JsonResponse
from ..models import Document, Folder, User, UserDocumentPermission, UserFolderPermission, Questionnaire, UserQuestionnairePermission, PostDocument, AnnouncementDocument, AssignmentSubmitDocument, PostQuestionnaire, AnnouncementQuestionnaire
from ..util.exceptions import ConflictQuotaExceeded, ConflictFolderAlreadyExists, Forbidden
from ..util.helpers import get_from_db
from ..util.serializers import documents_array_to_json, folders_array_to_json, document_to_json, folder_to_json, users_array_to_json, questionnaires_array_to_json, questionnaire_to_json

def get_my_files(request, only_my_files):
    my_documents = Document.objects.filter(author=request.session.user).select_related('folder')
    my_folders = Folder.objects.filter(author=request.session.user)
    my_questionnaires = Questionnaire.objects.filter(author=request.session.user, archived=False)
    published_documents_ids = __get_published_document_ids(my_documents)
    published_questionnaires_ids = __get_published_questionnaires_ids(my_questionnaires)
    response = { "my_files": {
                     "documents": documents_array_to_json(my_documents, annotate_as_protected=published_documents_ids),
                     "folders": folders_array_to_json(my_folders),
                     "questionnaires": questionnaires_array_to_json(my_questionnaires, annotate_as_protected=published_questionnaires_ids) }}
    if not only_my_files:
        user_document_permissions = UserDocumentPermission.objects.filter(user=request.session.user).select_related('document', 'document__author')
        user_folder_permissions = UserFolderPermission.objects.filter(user=request.session.user).select_related('folder', 'folder__author')
        user_questionnaire_permissions = UserQuestionnairePermission.objects.filter(user=request.session.user, questionnaire__archived=False).select_related('questionnaire', 'questionnaire__author')
        shared_with_me_documents = [udp.document for udp in user_document_permissions]
        shared_with_me_folders = [ufp.folder for ufp in user_folder_permissions]
        shared_with_me_questionnaires = [uqp.questionnaire for uqp in user_questionnaire_permissions]
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
        parent_folder_granted_users = list(UserFolderPermission.objects.filter(folder=parent_folder, user__archived=False).values_list('user', flat=True))
        permissions_to_create = [
            UserFolderPermission(user_id=user_id, folder=new_folder)
            for user_id in parent_folder_granted_users
        ]
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
        folder_granted_users = UserFolderPermission.objects.filter(folder=folder, user__archived=False).values_list('user', flat=True)
        permissions_to_create = []
        for user_id in folder_granted_users:
            if not UserDocumentPermission.objects.filter(user_id=user_id, document=document).exists():
                permissions_to_create.append(UserDocumentPermission(user_id=user_id, document=document))
        if permissions_to_create:
            UserDocumentPermission.objects.bulk_create(permissions_to_create)
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
        folder_granted_users = UserFolderPermission.objects.filter(folder=folder, user__archived=False).values_list('user', flat=True)
        permissions_to_create = []
        for user_id in folder_granted_users:
            if not UserQuestionnairePermission.objects.filter(user_id=user_id, questionnaire=questionnaire).exists():
                permissions_to_create.append(UserQuestionnairePermission(user_id=user_id, questionnaire=questionnaire))
        if permissions_to_create:
            UserQuestionnairePermission.objects.bulk_create(permissions_to_create)
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
    user_belongs_to_document = False
    if document.author == request.session.user:
        user_belongs_to_document = True
    else:
        user_belongs_to_document = UserDocumentPermission.objects.filter(
                                document=document, 
                                user=request.session.user).exists()
    if not user_belongs_to_document:
        raise Forbidden
    granted_users = UserDocumentPermission.objects.filter(document=document, user__archived=False).select_related('user')
    users = [udp.user for udp in granted_users]
    return JsonResponse({"success": True, "users": users_array_to_json(users)}, status=200)

def get_folder_users(request, folder_id):
    folder = get_from_db(Folder, id=folder_id)
    user_belongs_to_folder = False
    if folder.author == request.session.user:
        user_belongs_to_folder = True
    else:
        user_belongs_to_folder = UserFolderPermission.objects.filter(
                                folder=folder, 
                                user=request.session.user).exists()
    if not user_belongs_to_folder:
        raise Forbidden
    granted_users = UserFolderPermission.objects.filter(folder=folder, user__archived=False).select_related('user')
    users = [ufp.user for ufp in granted_users]
    return JsonResponse({"success": True, "users": users_array_to_json(users)}, status=200)

def get_questionnaire_users(request, q_id):
    questionnaire = get_from_db(Questionnaire, id=q_id, archived=False)
    user_belongs_to_questionnaire = False
    if questionnaire.author == request.session.user:
        user_belongs_to_questionnaire = True
    else:
        user_belongs_to_questionnaire = UserQuestionnairePermission.objects.filter(
                                questionnaire=questionnaire, 
                                user=request.session.user).exists()
    if not user_belongs_to_questionnaire:
        raise Forbidden
    granted_users = UserQuestionnairePermission.objects.filter(questionnaire=questionnaire, user__archived=False).select_related('user')
    users = [uqp.user for uqp in granted_users]
    return JsonResponse({"success": True, "users": users_array_to_json(users)}, status=200)

def grant_permission(request, document_ids, folder_ids, questionnaire_ids, usernames):
    users = User.objects.filter(username__in=usernames, archived=False)
    valid_usernames = [user.username for user in list(users)]
    failed_inexistent_users = [username for username in usernames if username not in valid_usernames]
    failed_already_added_users = set()
    # Create documents permissions
    documents = Document.objects.filter(identifier__in=document_ids, author=request.session.user)
    existing_document_permissions = set(UserDocumentPermission.objects.filter(document__in=documents, user__in=users).values_list('user__username', 'document__identifier'))
    document_permissions_to_create = []
    for document in documents:
        for user in users:
            if (user.username, document.identifier) not in existing_document_permissions:
                document_permissions_to_create.append(UserDocumentPermission(user=user, document=document))
            else:
                failed_already_added_users.add(user.username)
    if document_permissions_to_create:
        UserDocumentPermission.objects.bulk_create(document_permissions_to_create)
    # Create folder permissions
    folders = Folder.objects.filter(id__in=folder_ids, author=request.session.user)
    existing_folder_permissions = set(UserFolderPermission.objects.filter(folder__in=folders, user__in=users).values_list('user__username', 'folder__id'))
    folder_permissions_to_create = []
    for folder in folders:
        for user in users:
            if (user.username, folder.id) not in existing_folder_permissions:
                folder_permissions_to_create.append(UserFolderPermission(user=user, folder=folder))
            else:
                failed_already_added_users.add(user.username)
    if folder_permissions_to_create:
        UserFolderPermission.objects.bulk_create(folder_permissions_to_create)
    # Create questionnaire permissions
    questionnaires = Questionnaire.objects.filter(id__in=questionnaire_ids, author=request.session.user)
    existing_questionnaire_permissions = set(UserQuestionnairePermission.objects.filter(questionnaire__in=questionnaires, user__in=users).values_list('user__username', 'questionnaire__id'))
    questionnaire_permissions_to_create = []
    for questionnaire in questionnaires:
        for user in users:
            if (user.username, questionnaire.id) not in existing_questionnaire_permissions:
                questionnaire_permissions_to_create.append(UserQuestionnairePermission(user=user, questionnaire=questionnaire))
            else:
                failed_already_added_users.add(user.username)
    if questionnaire_permissions_to_create:
        UserQuestionnairePermission.objects.bulk_create(questionnaire_permissions_to_create)
    # Finish
    failed_already_added_users = list(failed_already_added_users)
    if len(failed_inexistent_users) == 0 and len(failed_already_added_users) == 0:
        return JsonResponse({"success": True}, status=201)
    else:
        error_msg = ""
        if len(failed_inexistent_users) > 0:
            error_msg += "Usuario(s) inexistente(s): " + ", ".join(failed_inexistent_users) + "; "
        if len(failed_already_added_users) > 0:
            error_msg += "Usuario(s) ya tiene(n) acceso: " + ", ".join(failed_already_added_users) + "; "
        return JsonResponse({"partial_success": True, "error": error_msg}, status=201)

def remove_permission(request, document_ids, folder_ids, questionnaire_ids, username):
    user = get_from_db(User, username=username)
    UserDocumentPermission.objects.filter(user=user,
                                          document__identifier__in=document_ids,
                                        document__author=request.session.user).delete()
    UserFolderPermission.objects.filter(user=user,
                                        folder__id__in=folder_ids,
                                        folder__author=request.session.user).delete()
    UserQuestionnairePermission.objects.filter(user=user,
                                               questionnaire__id__in=questionnaire_ids,
                                               questionnaire__author=request.session.user).delete()
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
