from .models import EPUSER_STUDENT, EPUSER_TEACHER, EPUSER_TEACHER_SYSADMIN, EPUSER_TEACHER_LEADER

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
        "group": classroom.group_id
    }

def classes_array_to_json(classes):
    result = []
    for c in classes:
        result.append(class_to_json(c))
    return result

def user_to_json(user):
    json_user = {
        "username": user.username,
        "name": user.name,
        "surname": user.surname,
        "roles": roles_array(user)
    }
    if user.student_group is not None:
        json_user["student_group"] = user.group_id
    return user

def users_array_to_json(users):
    result = []
    for u in users:
        result.append(user_to_json(u))
    return result
    
def roles_array(user):
    roles = []
    if teacher.roles == EPUSER_STUDENT:
        roles.append(JSON_STUDENT)
    if teacher.roles == EPUSER_TEACHER:
        roles.append(JSON_TEACHER)
    if teacher.roles == EPUSER_TEACHER_LEADER:
        roles.append(JSON_TEACHER)
        roles.append(JSON_LEADER)
    if teacher.roles == EPUSER_TEACHER_SYSADMIN:
        roles.append(JSON_TEACHER)
        roles.append(JSON_SYSADMIN)
    return roles




