from django.http import JsonResponse
from django.utils import timezone
from .. import constants
from ..models import User, Group, Announcement, Folder, AnnouncementDocument, Document, Questionnaire, AnnouncementQuestionnaire
from ..util.exceptions import Forbidden, InternalError
from ..util.helpers import get_from_db, get_or_create_folder, folder_name_for_year, folder_name_for_group_announcements
from ..util.serializers import groups_array_to_json, announcements_array_to_json

def all(request):
    groups = Group.objects.filter(archived=False)
    return JsonResponse({"groups": groups_array_to_json(groups)})

def get_announcements(request, g_id):
    group = get_from_db(Group, id=g_id, archived=False)
    can_see = request.session.user.role in [User.UserRole.TEACHER_SYSADMIN, \
                      User.UserRole.TEACHER_LEADER, User.UserRole.TEACHER] \
                      or (request.session.user.role == User.UserRole.STUDENT and request.session.user.student_group == group)
    if not can_see:
        raise Forbidden
    can_create = __has_permission_to_manage_announcements(request.session.user, group)
    announcements = Announcement.objects.filter(group=group).prefetch_related('announcementdocument_set__document', 'announcementquestionnaire_set__questionnaire').order_by("-publication_date")
    return JsonResponse({"success": True,
                         "announcements": announcements_array_to_json(announcements),
                         "can_create_announcements": can_create})

def create_announcement(request, g_id, title, content, attachments):
    group = get_from_db(Group, id=g_id, archived=False)
    can_create = __has_permission_to_manage_announcements(request.session.user, group)
    if not can_create:
        raise Forbidden
    new_announcement = Announcement()
    new_announcement.title = title
    new_announcement.content = content
    new_announcement.author = request.session.user
    new_announcement.group = group
    new_announcement.save()
    for a in attachments:
        if a["type"] == "document":
            try:
                document = Document.objects.get(identifier=a["identifier"])
            except Document.DoesNotExist:
                root_folder = get_or_create_folder(constants.POSTS_DOCUMENTS_ROOT_FOLDER_NAME, request.session.user)
                subroot_folder = get_or_create_folder(folder_name_for_year(group.year), request.session.user, root_folder)
                folder = get_or_create_folder(folder_name_for_group_announcements(group), request.session.user, subroot_folder)
                document = Document()
                document.identifier = a["identifier"]
                document.name = a["name"]
                document.size = a["size"]
                document.mime_type = a["mime_type"]
                document.author = request.session.user
                document.folder = folder
                document.save()
            new_announcement_document = AnnouncementDocument()
            new_announcement_document.document = document
            new_announcement_document.announcement = new_announcement
            new_announcement_document.save()
        if a["type"] == "questionnaire":
            questionnaire = Questionnaire.objects.get(id=a["id"])
            new_announcement_questionnaire = AnnouncementQuestionnaire()
            new_announcement_questionnaire.questionnaire = questionnaire
            new_announcement_questionnaire.announcement = new_announcement
            new_announcement_questionnaire.save()
    return JsonResponse({"success": True}, status=201)

def edit_announcement(request, a_id, title, content, attachments):
    announcement = get_from_db(Announcement, id=a_id)
    can_create = __has_permission_to_manage_announcements(request.session.user, announcement.group)
    if not can_create:
        raise Forbidden
    announcement.title = title
    announcement.content = content
    announcement.modification_date = timezone.now()
    announcement.save()
    __delete_any_relation_to_documents_or_questionnaires(announcement)
    for a in attachments:
        if a["type"] == "document":
            try:
                document = Document.objects.get(identifier=a["identifier"])
            except Document.DoesNotExist:
                root_folder = get_or_create_folder(constants.POSTS_DOCUMENTS_ROOT_FOLDER_NAME, request.session.user)
                subroot_folder = get_or_create_folder(folder_name_for_year(announcement.group), request.session.user, root_folder)
                folder = get_or_create_folder(folder_name_for_group_announcements(announcement.group), request.session.user, subroot_folder)
                document = Document()
                document.identifier = a["identifier"]
                document.name = a["name"]
                document.size = a["size"]
                document.mime_type = a["mime_type"]
                document.author = request.session.user
                document.folder = folder
                document.save()
            new_announcement_document = AnnouncementDocument()
            new_announcement_document.document = document
            new_announcement_document.announcement = announcement
            new_announcement_document.save()
        if a["type"] == "questionnaire":
            questionnaire = Questionnaire.objects.get(id=a["id"])
            new_announcement_questionnaire = AnnouncementQuestionnaire()
            new_announcement_questionnaire.questionnaire = questionnaire
            new_announcement_questionnaire.announcement = new_announcement
            new_announcement_questionnaire.save()
    return JsonResponse({"success": True}, status=200)

def delete_announcement(request, a_id):
    announcement = get_from_db(Announcement, id=a_id)
    can_delete = __has_permission_to_manage_announcements(request.session.user, announcement.group)
    if not can_delete:
        raise Forbidden
    announcement.delete()
    return JsonResponse({"success": True}, status=201)

def __has_permission_to_manage_announcements(user, group):
    if group.archived:
        return False
    return user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER] \
           or (user.role == User.UserRole.TEACHER and group.tutor == user)

def __delete_any_relation_to_documents_or_questionnaires(announcement):
    AnnouncementDocument.objects.filter(announcement=announcement).delete()
    AnnouncementQuestionnaire.objects.filter(announcement=announcement).delete()
