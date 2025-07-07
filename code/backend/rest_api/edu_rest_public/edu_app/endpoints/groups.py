from django.http import JsonResponse
from django.utils import timezone
from ..models import User, Group, Announcement, Folder, AnnouncementDocument, Document
from ..util.exceptions import Forbidden, InternalError
from ..util.helpers import get_from_db, get_or_create_folder, is_document_used_in_post_or_announcement
from ..util.serializers import groups_array_to_json, announcements_array_to_json
from .posts import POSTS_DOCUMENTS_ROOT_FOLDER_NAME

def all(request):
    groups = Group.objects.all()
    return JsonResponse({"groups": groups_array_to_json(groups)})

def get_announcements(request, group_tag):
    group = get_from_db(Group, tag=group_tag)
    can_see = request.session.user.role in [User.UserRole.TEACHER_SYSADMIN, \
                      User.UserRole.TEACHER_LEADER, User.UserRole.TEACHER] \
                      or (request.session.user.role == User.UserRole.STUDENT and request.session.user.student_group == group)
    can_create = __has_permission_to_manage_announcements(request.session.user, group)
    if not can_see:
        raise Forbidden
    announcements = Announcement.objects.filter(group=group).order_by("-publication_date")
    return JsonResponse({"success": True,
                         "announcements": announcements_array_to_json(announcements),
                         "can_create_announcements": can_create})

def create_announcement(request, group_tag, title, content, files):
    group = get_from_db(Group, tag=group_tag)
    can_create = __has_permission_to_manage_announcements(request.session.user, group)
    if not can_create:
        raise Forbidden
    new_announcement = Announcement()
    new_announcement.title = title
    new_announcement.content = content
    new_announcement.author = request.session.user
    new_announcement.group = group
    new_announcement.save()
    if len(files) > 0:
        root_folder = get_or_create_folder(POSTS_DOCUMENTS_ROOT_FOLDER_NAME, request.session.user)
        folder = get_or_create_folder(__folder_name_for_group(group), request.session.user, root_folder)
        for f in files:
            document = Document()
            document.identifier = f["identifier"]
            document.name = f["name"]
            document.size = f["size"]
            document.mime_type = f["mime_type"]
            document.author = request.session.user
            document.folder = folder
            document.is_protected = True
            document.save()
            announcement_document = AnnouncementDocument()
            announcement_document.document = document
            announcement_document.announcement = new_announcement
            announcement_document.save()
    return JsonResponse({"success": True}, status=201)

def edit_announcement(request, a_id, title, content, files):
    announcement = get_from_db(Announcement, id=a_id)
    can_create = __has_permission_to_manage_announcements(request.session.user, announcement.group)
    if not can_create:
        raise Forbidden
    announcement.title = title
    announcement.content = content
    announcement.modification_date = timezone.now()
    announcement.save()
    __delete_announcement_documents_and_unprotect_unused_documents(announcement)
    for f in files:
        try:
            document = Document.objects.get(identifier=f["identifier"])
            document.is_protected = True
            document.save()
        except Document.DoesNotExist:
            root_folder = get_or_create_folder(POSTS_DOCUMENTS_ROOT_FOLDER_NAME, request.session.user)
            folder = get_or_create_folder(__folder_name_for_group(announcement.group), request.session.user, root_folder)
            document = Document()
            document.identifier = f["identifier"]
            document.name = f["name"]
            document.size = f["size"]
            document.mime_type = f["mime_type"]
            document.author = request.session.user
            document.folder = folder
            document.is_protected = True
            document.save()
        announcement_document = AnnouncementDocument()
        announcement_document.document = document
        announcement_document.announcement = announcement
        announcement_document.save()
    return JsonResponse({"success": True}, status=200)

def delete_announcement(request, a_id):
    announcement = get_from_db(Announcement, id=a_id)
    can_delete = __has_permission_to_manage_announcements(request.session.user, announcement.group)
    if not can_delete:
        raise Forbidden
    __delete_announcement_documents_and_unprotect_unused_documents(announcement)
    announcement.delete()
    return JsonResponse({"success": True}, status=201)
        
def __folder_name_for_group(group):
    return group.tag

def __has_permission_to_manage_announcements(user, group):
    return user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER] \
           or (user.role == User.UserRole.TEACHER and group.tutor == user)
    
def __delete_announcement_documents_and_unprotect_unused_documents(announcement):
    announcement_documents = AnnouncementDocument.objects.filter(announcement=announcement)
    old_documents = list(map(lambda ad: ad.document, announcement_documents))
    announcement_documents.delete()
    for d in old_documents:
        if not is_document_used_in_post_or_announcement(d):
            d.is_protected = False
            d.save()
