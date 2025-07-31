from ..models import Post, User, Class, AnnouncementDocument, AnnouncementQuestionnaire, Questionnaire

JSON_STUDENT = "student"
JSON_TEACHER = "teacher"
JSON_SYSADMIN = "sysadmin"
JSON_LEADER = "school_leader"

JSON_PUBLICATION = "publication"
JSON_ASSIGNMENT = "assignment"
JSON_AMEND_EDIT = "amend_edit"
JSON_AMEND_DELETE = "amend_delete"

JSON_BLUE = "blue"
JSON_DARK_BLUE = "darkblue"
JSON_GREEN = "green"
JSON_PURPLE = "purple"
JSON_BROWN = "brown"
JSON_RED = "red"
JSON_ORANGE = "orange"
JSON_YELLOW = "yellow"

JSON_QUESTIONNAIRE_REGULAR = "regular"
JSON_QUESTIONNAIRE_SECRET_ANSWERS = "secret_answers"

def document_to_json(document):
    return {
        "identifier": document.identifier,
        "name": document.name,
        "size": document.size,
        "mime_type": document.mime_type,
        "folder_id": document.folder_id,
        "author": document.author.username,
        "created_at": document.created_at
    }

def group_to_json(group):
    return {
        "id": group.id,
        "tag": group.tag,
        "name": group.name,
        "year": group.year,
        "tutor": user_to_json(group.tutor)
    }

def class_to_json(classroom):
    return {
        "id": classroom.id,
        "name": classroom.name,
        "group_tag": classroom.group.tag,
        "group_year": classroom.group.year,
        "theme": class_theme(classroom)
    }

def user_to_json(user):
    json_user = {
        "username": user.username,
        "name": user.name,
        "surname": user.surname,
        "roles": roles_array(user)
    }
    if user.student_group:
        json_user["student_group_id"] = user.student_group_id
        json_user["student_group_tag"] = user.student_group.tag
    return json_user

def folder_to_json(folder):
    return {
        "id": folder.id,
        "name": folder.name,
        "parent_folder_id": folder.parent_folder_id,
        "author": folder.author.username,
        "created_at": folder.created_at
    }

def announcement_to_json(announcement):
    attachments = []
    for ad in AnnouncementDocument.objects.filter(announcement=announcement):
        document = document_to_json(ad.document)
        document["type"] = "document"
        attachments.append(document)
    for aq in AnnouncementQuestionnaire.objects.filter(announcement=announcement):
        questionnaire = questionnaire_to_json(aq.questionnaire)
        questionnaire["type"] = "questionnaire"
        attachments.append(questionnaire)
    json = {
        "id": announcement.id,
        "title": announcement.title,
        "content": announcement.content,
        "attachments": attachments,
        "author": announcement.author.username,
        "publication_date": announcement.publication_date
    }
    if (announcement.modification_date is not None):
        json["modification_date"] = announcement.modification_date
    return json

def questionnaire_to_json(questionnaire):
    return {
        "id": questionnaire.id,
        "title": questionnaire.title,
        "folder_id": questionnaire.folder_id,
        "author": questionnaire.author.username,
        "created_at": questionnaire.created_at
    }

def groups_array_to_json(groups):
    result = []
    for g in groups:
        result.append(group_to_json(g))
    return result

def classes_array_to_json(classes):
    result = []
    for c in classes:
        result.append(class_to_json(c))
    return result

def users_array_to_json(users):
    result = []
    for u in users:
        result.append(user_to_json(u))
    return result

def folders_array_to_json(folders):
    result = []
    for f in folders:
        result.append(folder_to_json(f))
    return result

def documents_array_to_json(documents, annotate_as_protected=None):
    result = []
    for d in documents:
        json = document_to_json(d)
        if annotate_as_protected and d.id in annotate_as_protected:
            json["is_protected"] = True
        result.append(json)
    return result

def announcements_array_to_json(announcements):
    result = []
    for a in announcements:
        result.append(announcement_to_json(a))
    return result

def questionnaires_array_to_json(questionnaires, annotate_as_protected=None):
    result = []
    for q in questionnaires:
        json = questionnaire_to_json(q)
        if annotate_as_protected and q.id in annotate_as_protected:
            json["is_protected"] = True
        result.append(json)
    return result

def class_detail_to_json(classroom, units, posts, is_class_editable_by_user):
    return {
        "id": classroom.id,
        "name": classroom.name,
        "evaluation_criteria": classroom.evaluation_criteria,
        "group": classroom.group_id,
        "theme": class_theme(classroom),
        "should_show_teacher_options": is_class_editable_by_user,
        "posts": posts,
        "units": units
    }

def assignment_detail_to_json(original_assignment, newest_edit, attachments, is_teacher, class_students, class_units, submits, your_submit):
    unit = original_assignment.unit if newest_edit is None else newest_edit.unit
    response = {
        "id": original_assignment.id,
        "title": original_assignment.title if newest_edit is None else newest_edit.title,
        "content": original_assignment.content if newest_edit is None else newest_edit.content,
        "unit_id": unit.id if unit else None,
        "class_units": list(map(lambda u: {"id": u.id, "name": u.name}, class_units)),
        "class_id": original_assignment.classroom_id,
        "author": original_assignment.author.username,
        "publication_date": original_assignment.publication_date,
        "assignment_due_date": original_assignment.assignment_due_date if newest_edit is None else newest_edit.assignment_due_date,
        "kind": post_kind(original_assignment),
        "theme": class_theme(original_assignment.classroom),
        "attachments": attachments,
        "should_show_teacher_options": is_teacher
    }
    if is_teacher:
        response["assignees"] = list(map(lambda u: user_to_json(u), class_students))
        response["submits"] = submits
    else:
        response["your_submit"] = your_submit
    return response

def text_question_to_json(question):
    return {
        "id": question.id,
        "title": question.title,
        "number": question.number,
        "type": "text"
    }

def choices_question_to_json(question, choices, correct_choice):
    json = {
        "id": question.id,
        "title": question.title,
        "choices": choices,
        "number": question.number,
        "type": "choices"
    }
    if correct_choice:
        json["correct_choice_id"] = correct_choice.id
        json["correct_answer_score"] = question.correct_answer_score
        json["incorrect_answer_score"] = question.incorrect_answer_score
    return json

def questionnaire_detail_to_json(questionnaire, questions, due_date, theme):
    return {
        "id": questionnaire.id,
        "title": questionnaire.title,
        "mode": questionnaire_mode(questionnaire),
        "questions": questions,
        "due_date": due_date,
        "theme": theme
    }
    
def roles_array(user):
    roles = []
    if user.role == User.UserRole.STUDENT:
        roles.append(JSON_STUDENT)
    if user.role == User.UserRole.TEACHER:
        roles.append(JSON_TEACHER)
    if user.role == User.UserRole.TEACHER_LEADER:
        roles.append(JSON_TEACHER)
        roles.append(JSON_LEADER)
    if user.role == User.UserRole.TEACHER_SYSADMIN:
        roles.append(JSON_TEACHER)
        roles.append(JSON_SYSADMIN)
    return roles

def post_kind(p):
    if p.kind == Post.PostKind.PUBLICATION:
        return JSON_PUBLICATION
    if p.kind == Post.PostKind.ASSIGNMENT:
        return JSON_ASSIGNMENT
    if p.kind == Post.PostKind.AMENDMENT_EDIT:
        return JSON_AMEND_EDIT
    if p.kind == Post.PostKind.AMENDMENT_DELETE:
        return JSON_AMEND_DELETE

def class_theme(c):
    if c.theme == Class.ClassTheme.BLUE:
        return JSON_BLUE
    if c.theme == Class.ClassTheme.DARK_BLUE:
        return JSON_DARK_BLUE
    if c.theme == Class.ClassTheme.GREEN:
        return JSON_GREEN
    if c.theme == Class.ClassTheme.PURPLE:
        return JSON_PURPLE
    if c.theme == Class.ClassTheme.BROWN:
        return JSON_BROWN
    if c.theme == Class.ClassTheme.RED:
        return JSON_RED
    if c.theme == Class.ClassTheme.ORANGE:
        return JSON_ORANGE
    if c.theme == Class.ClassTheme.YELLOW:
        return JSON_YELLOW

def questionnaire_mode(q):
    if q.mode == Questionnaire.QuestionnaireMode.REGULAR:
        return JSON_QUESTIONNAIRE_REGULAR
    if q.mode == Questionnaire.QuestionnaireMode.SECRET_ANSWERS:
        return JSON_QUESTIONNAIRE_SECRET_ANSWERS
