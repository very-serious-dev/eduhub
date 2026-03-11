import bcrypt
from django.http import JsonResponse
from django.db.models import Q
from .. import constants
from ..models import User, Group, Class, UserClass, UserSession
from ..util.serializers import groups_array_to_json, classes_array_to_json, users_array_to_json
from ..util.exceptions import BadRequest, ConflictUserAlreadyExists, ConflictGroupAlreadyExists
from ..util.helpers import get_from_db

def get_admin_home(request):
    users_count = User.objects.filter(archived=False).count()
    classes_count = Class.objects.filter(archived=False).count()
    serialized_groups = []
    groups = Group.objects.filter(archived=False).select_related('tutor')
    return JsonResponse({"usersCount": users_count,
                         "classesCount": classes_count,
                         "groups": groups_array_to_json(groups)})

def create_user(request, username, name, surname, password, role, student_group_id):
    if User.objects.filter(username=username).exists():
        raise ConflictUserAlreadyExists
    if role not in ['student', 'teacher', 'teacher_traineeship_coordinator']:
        raise BadRequest
    if role == 'student' and student_group_id is None:
        raise BadRequest
    is_teacher = role in ['teacher', 'teacher_traineeship_coordinator']
    new_user = User()
    new_user.username = username
    new_user.name = name
    new_user.surname = surname
    new_user.encrypted_password = bcrypt.hashpw(password.encode('utf8'), bcrypt.gensalt()).decode('utf8')
    if role == 'teacher_traineeship_coordinator':
        new_user.role = User.UserRole.TEACHER_TRAINEESHIP_COORDINATOR
    elif role == 'teacher':
        new_user.role = User.UserRole.TEACHER
    else:
        new_user.role = User.UserRole.STUDENT
    new_user.max_folders =               constants.TEACHER_MAX_FOLDERS if is_teacher else constants.STUDENT_MAX_FOLDERS
    new_user.max_documents =           constants.TEACHER_MAX_DOCUMENTS if is_teacher else constants.STUDENT_MAX_DOCUMENTS
    new_user.max_documents_size = constants.TEACHER_MAX_DOCUMENTS_SIZE if is_teacher else constants.STUDENT_MAX_DOCUMENTS_SIZE
    if not is_teacher:
        new_user.student_group = get_from_db(Group, id=student_group_id, archived=False)
    new_user.save()
    return JsonResponse({"success": True}, status=201)

def edit_user(request, path_username, json_username, name, surname, password, student_group_id):
    if path_username != json_username:
        if User.objects.filter(username=json_username).exists():
            raise ConflictUserAlreadyExists
    user = get_from_db(User, username=path_username, archived=False)
    if student_group_id:
        if user.role != User.UserRole.STUDENT:
            raise BadRequest
        else:
            user.student_group = get_from_db(Group, id=student_group_id, archived=False)
    user.username = json_username
    user.name = name
    user.surname = surname
    if password is not None:
        user.encrypted_password = bcrypt.hashpw(password.encode('utf8'), bcrypt.gensalt()).decode('utf8')
    user.save()
    return JsonResponse({"success": True}, status=201)

def delete_user(request, username):
    user = get_from_db(User, username=username, archived=False)
    user.archived = True
    user.save()
    UserSession.objects.filter(user=user).delete()
    return JsonResponse({"success": True}, status=200)

def get_teachers(request):
    users = User.objects.filter(Q(role=User.UserRole.TEACHER) | Q(role=User.UserRole.TEACHER_SYSADMIN) | Q(role=User.UserRole.TEACHER_LEADER)).filter(archived=False)
    return JsonResponse({"teachers": users_array_to_json(users) })

def create_group(request, tag, name, year, tutor_username):
    if Group.objects.filter(tag=tag, year=year).exists():
        raise ConflictGroupAlreadyExists
    new_group = Group()
    new_group.tag = tag
    new_group.name = name
    new_group.year = year
    new_group.tutor = get_from_db(User, username=tutor_username, archived=False)
    new_group.save()
    return JsonResponse({"success": True}, status=201)

def archive_group(request, g_id, new_group_id_for_students):
    group = get_from_db(Group, id=g_id, archived=False)
    group_users = User.objects.filter(role=User.UserRole.STUDENT, student_group=group, archived=False)
    if new_group_id_for_students:
        new_group = get_from_db(Group, id=new_group_id_for_students, archived=False)
        group_users.update(student_group=new_group)
    else:
        group_users.update(archived=True)
    Class.objects.filter(group=group).update(archived=True)
    group.archived = True
    group.save()
    return JsonResponse({"success": True}, status=200)

def get_all_classes(request):
    classes = Class.objects.filter(archived=False)
    return JsonResponse({"classes": classes_array_to_json(classes) })
