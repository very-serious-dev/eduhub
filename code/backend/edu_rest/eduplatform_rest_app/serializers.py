from .models import EPUSER_STUDENT, EPUSER_TEACHER, EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER
from .models import EPUnit, EPPost

JSON_STUDENT = "student"
JSON_TEACHER = "teacher"
JSON_SYSADMIN = "sysadmin"
JSON_LEADER = "school_leader"

def group_to_json(group):
    return {
        "tag": group.tag,
        "name": group.name,
        "tutor": {
            "username": group.tutor.username if group.tutor is not None else "none",
            "name": group.tutor.name if group.tutor is not None else "none",
            "surname": group.tutor.surname if group.tutor is not None else "none",
        }
    }

def groups_array_to_json(groups):
    result = []
    for g in groups:
        result.append(group_to_json(g))
    return result

def class_to_json(classroom):
    return {
        "id": classroom.id,
        "name": classroom.name,
        "group": classroom.group_id,
        "color": classroom.color
    }

def classes_array_to_json(classes):
    result = []
    for c in classes:
        result.append(class_to_json(c))
    return result

def class_detail_to_json(classroom, isClassEditableByUser):
    units = []
    for u in EPUnit.objects.filter(classroom=classroom).order_by("name"):
        units.append({"id": u.id, "name": u.name})

    posts = []
    for p in EPPost.objects.filter(classroom=classroom).order_by("publication_date"):
        posts.append({"id": p.id, "title": p.title, "content": p.content, "publication_date": p.publication_date})
        
    return {
        "id": classroom.id,
        "name": classroom.name,
        "group": classroom.group_id,
        "color": classroom.color,
        "shouldShowEditButton": isClassEditableByUser,
        "posts": posts,
        "units": units
    }

def user_to_json(user):
    json_user = {
        "username": user.username,
        "name": user.name,
        "surname": user.surname,
        "roles": roles_array(user)
    }
    if user.student_group is not None:
        json_user["student_group"] = user.student_group_id
    return json_user

def users_array_to_json(users):
    result = []
    for u in users:
        result.append(user_to_json(u))
    return result
    
def roles_array(user):
    roles = []
    if user.role == EPUSER_STUDENT:
        roles.append(JSON_STUDENT)
    if user.role == EPUSER_TEACHER:
        roles.append(JSON_TEACHER)
    if user.role == EPUSER_TEACHER_LEADER:
        roles.append(JSON_TEACHER)
        roles.append(JSON_LEADER)
    if user.role == EPUSER_TEACHER_SYSADMIN:
        roles.append(JSON_TEACHER)
        roles.append(JSON_SYSADMIN)
    return roles
