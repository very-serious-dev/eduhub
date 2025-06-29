from django.urls import path
from .preconditions import facade
from .endpoints import users, groups, classes, posts, documents

urlpatterns = [
    path("admin/home",                               facade.admin_home),
    path("admin/users",                              facade.admin_create_user),
    path("admin/users/<username>",                   facade.admin_edit_delete_user),
    path("admin/teachers",                           facade.admin_get_teachers),
    path("admin/groups",                             facade.admin_create_group),
    path("admin/classes",                            facade.admin_get_classes),
    path("users",                                    users.get_users),
    path("sessions",                                 users.login_logout),
    path("passwords",                                users.reset_password),
    path("groups",                                   groups.get_all_groups),
    path("groups/<groupTag>/announcements",          groups.handle_group_announcements),
    path("announcements/<int:announcementId>",       groups.handle_announcement),
    path("classes",                                  classes.handle_classes),
    path("classes/<int:classId>",                    classes.handle_class_detail),
    path("classes/<int:classId>/users",              classes.handle_class_participants),
    path("classes/<int:classId>/users/<username>",   classes.delete_class_participant),
    path("classes/<int:classId>/units",              classes.create_class_unit),
    path("classes/<int:classId>/units/<int:unitId>", classes.handle_class_unit),
    path("classes/<int:classId>/scores",             classes.download_scores),
    path("classes/<int:classId>/posts",              posts.create_post),
    path("posts/<int:postId>/amendments",            posts.amend_post),
    path("assignments/<int:assignmentId>",           posts.assignment_detail),
    path("assignments/<int:assignmentId>/submits",   posts.create_assignment_submit),
    path("assignments/<int:assignmentId>/submits/<username>/score", posts.score_assignment_submit),
    path("assignments/<int:assignmentId>/scores",    posts.publish_all_scores),
    path("documents",                                documents.get_documents_and_folders),
    path("folders",                                  documents.create_folder),
    path("documents/<document_identifier>",          documents.move_document),
    path("documents/<document_identifier>/users",    documents.get_document_users),
    path("folders/<int:folder_id>",                  documents.move_folder),
    path("folders/<int:folder_id>/users",            documents.get_folder_users),
    path("files/permissions",                        documents.update_files_users)
]
