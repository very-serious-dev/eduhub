from .models import USER_STUDENT, USER_TEACHER, USER_TEACHER_SYSADMIN, USER_TEACHER_LEADER, POST_PUBLICATION, POST_ASSIGNMENT
from .models import Unit, Post, PostDocument, Document, AssignmentSubmit, AssignmentSubmitDocument, UserClass

JSON_STUDENT = "student"
JSON_TEACHER = "teacher"
JSON_SYSADMIN = "sysadmin"
JSON_LEADER = "school_leader"

def user_to_json(user):
    return {
        "username": user.username if user is not None else "none",
        "name": user.name if user is not None else "none",
        "surname": user.surname if user is not None else "none",
    }

def document_to_json(document):
    return {
        "identifier": document.identifier,
        "name": document.name,
        "size": document.size,
        "mime_type": document.mime_type
    }

def group_to_json(group):
    return {
        "tag": group.tag,
        "name": group.name,
        "tutor": user_to_json(group.tutor)
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
    for u in Unit.objects.filter(classroom=classroom).order_by("name"):
        units.append({"id": u.id, "name": u.name})
    posts = []
    # REFACTOR: serializers.py shouldn't contain ORM code
    for p in Post.objects.filter(classroom=classroom).order_by("-publication_date"):
        response_post = {
            "id": p.id,
            "title": p.title,
            "content": p.content,
            "author": p.author.username,
            "publication_date": p.publication_date
        }
        if p.unit is not None:
            response_post["unit_name"] = p.unit.name
        if p.kind == POST_PUBLICATION:
            response_post["kind"] = "publication"
            # Only hit database to retrieve associated files for regular posts,
            # because the other kind (=POST_ASSIGNMENT) are opened in another tab
            response_post_documents = []
            for pd in PostDocument.objects.filter(post=p):
                response_post_documents.append(document_to_json(pd.document))
            response_post["files"] = response_post_documents
        elif p.kind == POST_ASSIGNMENT:
            response_post["kind"] = "assignment"
            response_post["assignment_due_date"] = p.assignment_due_date
        posts.append(response_post)
    return {
        "id": classroom.id,
        "name": classroom.name,
        "group": classroom.group_id,
        "color": classroom.color,
        "should_show_edit_button": isClassEditableByUser,
        "posts": posts,
        "units": units
    }

def assignment_detail_to_json(assignment, user):
    response = {
        "id": assignment.id,
        "title": assignment.title,
        "content": assignment.content,
        "author": assignment.author.username,
        "publication_date": assignment.publication_date
    }
    response_documents = []
    # REFACTOR: serializers.py shouldn't contain ORM code
    for pd in PostDocument.objects.filter(post=assignment):
        response_documents.append(document_to_json(pd.document))
    response["files"] = response_documents
    response["assignment_due_date"] = assignment.assignment_due_date
    isTeacher = user.role in [USER_TEACHER, USER_TEACHER_LEADER, USER_TEACHER_SYSADMIN]
    response["should_show_teacher_options"] = isTeacher
    if isTeacher:
        submits = []
        for s in AssignmentSubmit.objects.filter(assignment=assignment):
            submit = {
              "author": user_to_json(s.author),
              "submit_date": s.submit_date
            }
            if s.comment is not None:
                submit["comment"] = s.comment
            submit_documents = []
            for sd in AssignmentSubmitDocument.objects.filter(submit=s):
                submit_documents.append(document_to_json(sd.document))
            submit["files"] = submit_documents
            submits.append(submit)
        response["submits"] = submits
        assignees = []
        for uc in UserClass.objects.filter(classroom=assignment.classroom, user__role=USER_STUDENT).order_by("user__surname"):
            assignees.append(user_to_json(uc.user))
        response["assignees"] = assignees
    else:
        try:
            s = AssignmentSubmit.objects.get(assignment=assignment, author=user)
            submit = {
              "author": user_to_json(s.author),
              "submit_date": s.submit_date
            }
            if s.comment is not None:
                submit["comment"] = s.comment
            submit_documents = []
            for sd in AssignmentSubmitDocument.objects.filter(submit=s):
                submit_documents.append(document_to_json(sd.document))
            submit["files"] = submit_documents
            response["your_submit"] = submit
        except AssignmentSubmit.DoesNotExist:
            pass
    return response

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
    if user.role == USER_STUDENT:
        roles.append(JSON_STUDENT)
    if user.role == USER_TEACHER:
        roles.append(JSON_TEACHER)
    if user.role == USER_TEACHER_LEADER:
        roles.append(JSON_TEACHER)
        roles.append(JSON_LEADER)
    if user.role == USER_TEACHER_SYSADMIN:
        roles.append(JSON_TEACHER)
        roles.append(JSON_SYSADMIN)
    return roles
