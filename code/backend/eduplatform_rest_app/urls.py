from django.urls import path
from . import endpoints_users, endpoints_classes, endpoints_admin, endpoints_groups

urlpatterns = [
    # Admin
    # TO-DO: Review in the future if some of these can be merged with
    # endpoints for regular users
    path("admin/home", endpoints_admin.home),
    path("admin/users", endpoints_admin.handle_users),
    path("admin/users/teachers", endpoints_admin.get_teachers),
    path("admin/groups", endpoints_admin.handle_groups),
    path("admin/classes", endpoints_admin.handle_classes),
    path("admin/classes/<int:classId>/teachers", endpoints_admin.add_teacher_to_class),
    path("admin/classes/<int:classId>/students", endpoints_admin.add_students_to_class),
    path("admin/classes", endpoints_admin.handle_classes),
    
    # Regular users
    path("sessions", endpoints_users.handle_login),
    path("groups", endpoints_groups.handle_groups),
    path("classes", endpoints_classes.handle_classes),
    path("classes/<int:classId>", endpoints_classes.handle_class_detail),
    path("classes/<int:classId>/users", endpoints_classes.handle_class_participants)
]
