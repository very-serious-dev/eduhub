from django.http import QueryDict
from ..endpoints import admin, users, groups, classes, posts, documents
from ..models import User
from ..util.helpers import maybe_unhappy, expect_body_with, require_role, require_valid_session, validate_username, validate_password, validate_tag, validate_year, parse_usernames_list
from ..util.exceptions import Unsupported, BadRequest, BadRequestIllegalMove

"""
facade.py
--
The methods in here:
- Ensure that the requester has the right user privileges (*)
- Deserialize and statically validate any parameters
- Invoke the appropriate handler according to the HTTP method and semantics

  (*) In some cases, additional privileges check that require
      database access take place inside endpoint handlers
"""

@maybe_unhappy
def admin_home(request):
    if request.method == "GET":
        require_role([User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        return admin.get_admin_home(request)
    else:
        raise Unsupported

@maybe_unhappy
def admin_create_user(request):
    if request.method == "POST":
        require_role([User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        username, name, surname, password, student_group, is_teacher = expect_body_with('username', 'name', 'surname', 'password', optional=['student_group', 'is_teacher'], request=request)
        validate_username(username)
        validate_password(password)
        if '"' in name or '"' in surname or ',' in name or ',' in surname:
            raise BadRequest
        return admin.create_user(request, username, name, surname, password, student_group, is_teacher)
    else:
        raise Unsupported

@maybe_unhappy
def admin_edit_delete_user(request, username):
    if request.method == "PUT":
        require_role([User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        json_username, name, surname, password = expect_body_with('username', 'name', 'surname', optional=['password'], request=request)
        validate_username(username)
        if password is not None:
            validate_password(password)
        if '"' in name or '"' in surname or ',' in name or ',' in surname:
            raise BadRequest
        return admin.edit_user(request, username, json_username, name, surname, password)
    elif request.method == "DELETE":
        return admin.delete_user(request, username)
    else:
        raise Unsupported

@maybe_unhappy
def admin_get_teachers(request):
    if request.method == "GET":
        require_role([User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        return admin.get_teachers(request)
    else:
        raise Unsupported

@maybe_unhappy
def admin_create_group(request):
    if request.method == "POST":
        require_role([User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        tag, name, year, tutor_username = expect_body_with('tag', 'name', 'year', 'tutor_username', request=request)
        validate_tag(tag)
        validate_year(year)
        return admin.create_group(request, tag, name, year, tutor_username)
    else:
        raise Unsupported

@maybe_unhappy
def admin_get_classes(request):
    if request.method == "GET":
        require_role([User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        return admin.get_all_classes(request)
    else:
        raise Unsupported

@maybe_unhappy
def users_search(request):
    if request.method == "GET":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        q = request.GET.get("search")
        return users.search(request, q)
    else:
        raise Unsupported

@maybe_unhappy
def users_login_logout(request):
    if request.method == "POST":
        username, password = expect_body_with('username', 'password', request=request)
        return users.login(request, username, password)
    elif request.method == "DELETE":
        require_valid_session(request=request)
        return users.logout(request)
    else:
        raise Unsupported

@maybe_unhappy
def users_reset_password(request):
    if request.method == "POST":
        password, new_password, password_reset_token = expect_body_with('password', 'new_password', 'password_reset_token', request=request)
        validate_password(new_password)
        return users.reset_password(request, password, new_password, password_reset_token)
    else:
        raise Unsupported

@maybe_unhappy
def groups_get_all(request):
    if request.method == "GET":
        require_valid_session(request=request)
        return groups.all(request)
    else:
        raise Unsupported

@maybe_unhappy
def groups_create_get_announcements(request, group_tag):
    if request.method == "GET":
        require_valid_session(request=request)
        return groups.get_announcements(request, group_tag)
    elif request.method == "POST":
        require_valid_session(request=request)
        title, content, files = expect_body_with('title', 'content', 'files', request=request)
        return groups.create_announcement(request, group_tag, title, content, files)
    else:
        raise Unsupported

@maybe_unhappy
def groups_edit_delete_announcement(request, a_id):
    if request.method == "PUT":
        require_valid_session(request=request)
        title, content, files = expect_body_with('title', 'content', 'files', request=request)
        return groups.edit_announcement(request, a_id, title, content, files)
    elif request.method == "DELETE":
        require_valid_session(request=request)
        return groups.delete_announcement(request, a_id)
    else:
        raise Unsupported

@maybe_unhappy
def classes_create_get_my_classes(request):
    if request.method == "GET":
        require_valid_session(request=request)
        return classes.get_my_classes(request)
    elif request.method == "POST":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        name, group_tag, automatically_add_teacher = expect_body_with('name', 'group', optional=['automatically_add_teacher'], request=request)
        return classes.create_class(request, name, group_tag, automatically_add_teacher)
    else:
        raise Unsupported

@maybe_unhappy
def classes_get_edit_delete_class(request, c_id):
    if request.method == "GET":
        require_valid_session(request=request)
        only_newer_than_post_with_id = request.GET.get("newerThanPostWithId")
        return classes.get_class(request, c_id, only_newer_than_post_with_id)
    elif request.method == "PUT":
        require_valid_session(request=request)
        name, evaluation_criteria = expect_body_with('name', optional=['evaluation_criteria'], request=request)
        return classes.edit_class(request, c_id, name, evaluation_criteria)
    elif request.method == "DELETE":
        require_valid_session(request=request)
        return classes.delete_class(request, c_id)
    else:
        raise Unsupported

@maybe_unhappy
def classes_get_add_participants(request, c_id):
    if request.method == "GET":
        require_valid_session(request=request)
        return classes.get_participants(request, c_id)
    elif request.method == "PUT":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        username = expect_body_with('usernames', request=request)
        usernames_list = parse_usernames_list(username)
        return classes.add_participants(request, c_id, usernames_list)
    else:
        raise Unsupported

@maybe_unhappy
def classes_delete_participant(request, c_id, username):
    if request.method == "DELETE":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        return classes.delete_participant(request, c_id, username)
    else:
        raise Unsupported

@maybe_unhappy
def classes_create_unit(request, c_id):
    if request.method == "POST":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        name = expect_body_with('name', request=request)
        return classes.create_unit(request, c_id, name)
    else:
        raise Unsupported

@maybe_unhappy
def classes_edit_delete_unit(request, u_id):
    if request.method == "PUT":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        name = expect_body_with('name', request=request)
        return classes.edit_unit(request, u_id, name)
    elif request.method == "DELETE":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        return classes.delete_unit(request, u_id)
    else:
        raise Unsupported

@maybe_unhappy
def classes_download_scores(request, c_id):
    if request.method == "GET":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        return classes.download_scores(request, c_id)
    else:
        raise Unsupported

@maybe_unhappy
def posts_create(request, c_id):
    if request.method == "POST":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        title, content, post_type, files, unit_id, assignment_due_date = expect_body_with('title', 'content', 'post_type', 'files', optional=['unit_id', 'assignment_due_date'], request=request)
        if '"' in title or ',' in title:
            raise BadRequest
        if post_type not in ["publication", "assignment"]:
            raise BadRequest
        return posts.create_post(request, c_id, title, content, post_type, files, unit_id, assignment_due_date)
    else:
        raise Unsupported

@maybe_unhappy
def posts_amend(request, p_id):
    if request.method == "POST":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        post_type, title, content, files, unit_id, assignment_due_date = expect_body_with('post_type', optional=['title', 'content', 'files', 'unit_id', 'assignment_due_date'], request=request)
        if title and ('"' in title or ',' in title):
            raise BadRequest
        if post_type not in ["amend_delete", "amend_edit"]:
            raise BadRequest
        return posts.amend_post(request, p_id, title, content, post_type, files, unit_id, assignment_due_date)
    else:
        raise Unsupported

@maybe_unhappy
def posts_get_assignment(request, a_id):
    if request.method == "GET":
        require_valid_session(request=request)
        return posts.get_assignment(request, a_id)
    else:
        raise Unsupported

@maybe_unhappy
def posts_create_assignment_submit(request, a_id):
    if request.method == "POST":
        require_role([User.UserRole.STUDENT], request=request)
        files, comment = expect_body_with('files', optional=['comment'], request=request)
        if (comment is None or len(comment) == 0) and len(files) == 0:
            raise BadRequest
        return posts.create_assignment_submit(request, a_id, files, comment)
    else:
        raise Unsupported

@maybe_unhappy
def posts_create_delete_score(request, a_id, username):
    if request.method == "PUT":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        score, should_publish = expect_body_with('score', optional=['is_published'], request=request)
        return posts.score_submit(request, a_id, username, score, should_publish)
    elif request.method == "DELETE":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        return posts.delete_score(request, a_id, username)
    else:
        raise Unsupported

@maybe_unhappy
def posts_publish_all_scores(request, a_id):
    if request.method == "POST":
        require_role([User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)
        return posts.publish_all_scores(request, a_id)
    else:
        raise Unsupported

@maybe_unhappy
def documents_get_my_files(request):
    if request.method == "GET":
        require_valid_session(request=request)
        return documents.get_documents_and_folders(request)
    else:
        raise Unsupported

@maybe_unhappy
def documents_create_folder(request):
    if request.method == "POST":
        require_valid_session(request=request)
        name, parent_folder_id = expect_body_with('name', optional=['parent_folder_id'], request=request)
        return documents.create_folder(request, name, parent_folder_id)
    else:
        raise Unsupported

@maybe_unhappy
def documents_move_document(request, d_id):
    if request.method == "PUT":
        require_valid_session(request=request)
        folder_id = expect_body_with(optional=['folder_id'], request=request)
        return documents.move_document(request, d_id, folder_id)
    else:
        raise Unsupported

@maybe_unhappy
def documents_get_document_users(request, d_id):
    if request.method == "GET":
        require_valid_session(request=request)
        return documents.get_document_users(request, d_id)
    else:
        raise Unsupported

@maybe_unhappy
def documents_move_folder(request, f_id):
    if request.method == "PUT":
        require_valid_session(request=request)
        parent_folder_id = expect_body_with(optional=['parent_folder_id'], request=request)
        if parent_folder_id and parent_folder_id == f_id:
            raise BadRequestIllegalMove
        url_query = QueryDict(request.META.get("QUERY_STRING", ""))
        url_docs = url_query.get("documentIds", None)
        url_folders = url_query.get("folderIds", None)
        document_ids = url_docs.split(",") if url_docs is not None else []
        folder_ids = url_folders.split(",") if url_folders is not None else []
        if len(document_ids) == 0 and len(folder_ids) == 0:
            raise BadRequest
        return documents.move_folder(request, f_id, parent_folder_id, folder_ids, document_ids)
    else:
        raise Unsupported

@maybe_unhappy
def documents_get_folder_users(request, f_id):
    if request.method == "GET":
        require_valid_session(request=request)
        return documents.get_folder_users(request, f_id)
    else:
        raise Unsupported

@maybe_unhappy
def documents_update_files_permissions(request):
    if request.method == "PUT":
        require_valid_session(request=request)
        url_query = QueryDict(request.META.get("QUERY_STRING", ""))
        url_docs = url_query.get("documentIds", None)
        url_folders = url_query.get("folderIds", None)
        document_ids = url_docs.split(",") if url_docs is not None else []
        folder_ids = url_folders.split(",") if url_folders is not None else []
        if len(document_ids) == 0 and len(folder_ids) == 0:
            raise BadRequest
        username = expect_body_with('usernames', request=request)
        usernames_list = parse_usernames_list(username)
        return documents.grant_permission(request, document_ids, folder_ids, usernames_list)
    elif request.method == "DELETE":
        require_valid_session(request=request)
        url_query = QueryDict(request.META.get("QUERY_STRING", ""))
        url_docs = url_query.get("documentIds", None)
        url_folders = url_query.get("folderIds", None)
        document_ids = url_docs.split(",") if url_docs is not None else []
        folder_ids = url_folders.split(",") if url_folders is not None else []
        if len(document_ids) == 0 and len(folder_ids) == 0:
            raise BadRequest
        username = expect_body_with('username', request=request)
        return documents.remove_permission(request, document_ids, folder_ids, username)
    else:
        raise Unsupported

