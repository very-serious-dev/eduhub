from .models import STUDENT, TEACHER, SCHOOL_LEADER, SYSADMIN

def group_to_json(group):
    return {
        "tag": group.tag,
        "name": group.name,
        # FIX-ME: This will fail if tutor is null
        "tutor": {
            "username": group.tutor.user.username,
            "name": group.tutor.user.name,
            "surname": group.tutor.user.surname
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

def student_to_json(student):
    return {
        "username": student.user.username,
        "name": student.user.name,
        "surname": student.user.surname,
        "roles": [STUDENT],
        "student_group": student.group_id
    }

def students_array_to_json(students):
    result = []
    for s in students:
        result.append(student_to_json(s))
    return result
    
def teacher_to_json(teacher):
    return {
        "username": teacher.user.username,
        "name": teacher.user.name,
        "surname": teacher.user.surname,
        "roles": roles_array(teacher)
    }
 
def roles_array(teacher):
    roles = [TEACHER]
    if teacher.is_school_leader:
        roles.append(SCHOOL_LEADER)
    if teacher.is_sysadmin:
        roles.append(SYSADMIN)
    return roles

def teachers_array_to_json(teachers):
    result = []
    for t in teachers:
        result.append(teacher_to_json(t))
    return result

