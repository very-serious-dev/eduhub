from django.urls import path
from . import endpoints_users, endpoints_classes, endpoints_admin, endpoints_posts, endpoints_documents

urlpatterns = [
    path("admin/home",                               endpoints_admin.home),
    path("admin/users",                              endpoints_admin.create_user),
    path("admin/users/teachers",                     endpoints_admin.get_teachers),
    path("admin/groups",                             endpoints_admin.create_group),
    path("admin/classes",                            endpoints_admin.get_all_classes),
    path("admin/sessions",                           endpoints_admin.verify_session),
    path("users",                                    endpoints_users.get_users),
    path("sessions",                                 endpoints_users.login_logout),
    path("groups",                                   endpoints_classes.get_all_groups),
    path("classes",                                  endpoints_classes.handle_classes),
    path("classes/<int:classId>",                    endpoints_classes.handle_class_detail),
    path("classes/<int:classId>/users",              endpoints_classes.handle_class_participants),
    path("classes/<int:classId>/users/<username>",   endpoints_classes.delete_class_participant),
    path("classes/<int:classId>/units",              endpoints_classes.create_class_unit),
    path("classes/<int:classId>/units/<int:unitId>", endpoints_classes.handle_class_unit),
    path("classes/<int:classId>/posts",              endpoints_posts.create_post),
    path("posts/<int:postId>/amendments",            endpoints_posts.amend_post),
    path("assignments/<int:assignmentId>",           endpoints_posts.assignment_detail),
    path("assignments/<int:assignmentId>/submits",   endpoints_posts.create_assignment_submit),
    path("documents",                                endpoints_documents.handle_documents),
    path("folders",                                  endpoints_documents.create_folder)
]
