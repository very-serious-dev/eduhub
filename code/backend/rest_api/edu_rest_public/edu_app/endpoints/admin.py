import bcrypt
from django.http import JsonResponse
from django.db.models import Q
from ..models import User, Group, Class, UserClass, UserSession
from ..util.serializers import groups_array_to_json, classes_array_to_json, users_array_to_json
from ..util.exceptions import BadRequest, ConflictUserAlreadyExists, ConflictGroupAlreadyExists
from ..util.helpers import get_from_db

TEACHER_MAX_FOLDERS = 500
TEACHER_MAX_DOCUMENTS = 2000
TEACHER_MAX_DOCUMENTS_SIZE = 5 * 1024 * 1024 * 1024 # 5Gb
STUDENT_MAX_FOLDERS = 50
STUDENT_MAX_DOCUMENTS = 200
STUDENT_MAX_DOCUMENTS_SIZE = 1 * 1024 * 1024 * 512 # 500Mb

def get_admin_home(request):
    users_count = User.objects.filter(archived=False).count()
    classes_count = Class.objects.filter(archived=False).count()
    serialized_groups = []
    groups = Group.objects.all()
    return JsonResponse({"usersCount": users_count,
                         "classesCount": classes_count,
                         "groups": groups_array_to_json(groups)})

def create_user(request, username, name, surname, password, student_group, is_teacher):
    if User.objects.filter(username=username).exists():
        raise ConflictUserAlreadyExists
    if is_teacher != True and student_group is None:
        raise BadRequest
    new_user = User()
    new_user.username = username
    new_user.name = name
    new_user.surname = surname
    new_user.encrypted_password = bcrypt.hashpw(password.encode('utf8'), bcrypt.gensalt()).decode('utf8')
    new_user.role =                    User.UserRole.STUDENT if is_teacher != True else User.UserRole.TEACHER
    new_user.max_folders =               STUDENT_MAX_FOLDERS if is_teacher != True else TEACHER_MAX_FOLDERS
    new_user.max_documents =           STUDENT_MAX_DOCUMENTS if is_teacher != True else TEACHER_MAX_DOCUMENTS
    new_user.max_documents_size = STUDENT_MAX_DOCUMENTS_SIZE if is_teacher != True else TEACHER_MAX_DOCUMENTS_SIZE
    if is_teacher != True:
        new_user.student_group = get_from_db(Group, tag=student_group)
    new_user.save()
    return JsonResponse({"success": True}, status=201)

def edit_user(request, path_username, json_username, name, surname, password):
    if path_username != json_username:
        if User.objects.filter(username=json_username).exists():
            raise ConflictUserAlreadyExists
    user = get_from_db(User, username=path_username, archived=False)
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

def get_all_classes(request):
    classes = Class.objects.filter(archived=False)
    return JsonResponse({"classes": classes_array_to_json(classes) })
