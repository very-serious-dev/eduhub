from ..endpoints import admin
from ..models import User
from ..util.helpers import maybe_unhappy, expect_body_with, require_role, validate_username, validate_password, validate_tag, validate_year
from ..util.exceptions import Unsupported

"""
facade.py
--
The methods in here:
* Ensure that the requester has the right user privileges.
* Deserialize and statically validates any parameters
* Invoke the appropriate handler according to the HTTP method and semantics
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
