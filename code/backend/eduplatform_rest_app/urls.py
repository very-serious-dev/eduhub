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
    
    # Regular users
    path("users", endpoints_users.handle_users),
    path("sessions", endpoints_users.handle_login),
    path("groups", endpoints_groups.handle_groups),
    path("classes", endpoints_classes.handle_classes),
    path("classes/<int:classId>", endpoints_classes.handle_class_detail),
    path("classes/<int:classId>/users", endpoints_classes.handle_class_participants),
    path("classes/<int:classId>/users/<username>", endpoints_classes.handle_class_participant_deletion),
    path("classes/<int:classId>/units", endpoints_classes.handle_class_units),
    path("classes/<int:classId>/units/<int:unitId>", endpoints_classes.handle_class_unit),
]
