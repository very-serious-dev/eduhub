from django.http import JsonResponse
from django.db.models import Q
from django.utils import timezone
from ..models import User, Class, UserClass, Unit, Post, Document, PostDocument, AssignmentSubmit, AssignmentSubmitDocument, Folder, Questionnaire, PostQuestionnaire
from ..util.exceptions import Forbidden, ForbiddenAssignmentSubmit, NotFound
from ..util.helpers import get_from_db, get_or_create_folder, can_edit_class, can_see_class, is_document_used_in_post_or_announcement, is_questionnaire_used_in_post_or_announcement
from ..util.serializers import assignment_detail_to_json, document_to_json, user_to_json, questionnaire_to_json

POSTS_DOCUMENTS_ROOT_FOLDER_NAME = "Publicaciones"
ASSIGNMENT_SUBMITS_ROOT_FOLDER_NAME = "Entregas"

def create_post(request, c_id, title, content, post_type, attachments, unit_id, assignment_due_date):
    classroom = get_from_db(Class, id=c_id)
    if not can_edit_class(request.session.user, classroom):
        raise Forbidden
    unit = get_from_db(Unit, id=unit_id) if unit_id else None
    new_post = Post()
    new_post.title = title
    new_post.content = content
    new_post.unit = unit
    new_post.classroom = classroom
    new_post.author = request.session.user
    if post_type == "publication":
        new_post.kind = Post.PostKind.PUBLICATION
    elif post_type == "assignment":
        new_post.kind = Post.PostKind.ASSIGNMENT
        new_post.assignment_due_date = assignment_due_date
    new_post.save()
    for a in attachments:
        if a["type"] == "document":
            try:
                document = Document.objects.get(identifier=a["identifier"])
                document.is_protected = True
                document.save()
            except Document.DoesNotExist:
                root_folder = get_or_create_folder(POSTS_DOCUMENTS_ROOT_FOLDER_NAME, request.session.user)
                folder = get_or_create_folder(__folder_name_for_classroom(classroom), request.session.user, root_folder)
                document = Document()
                document.identifier = a["identifier"]
                document.name = a["name"]
                document.size = a["size"]
                document.mime_type = a["mime_type"]
                document.author = request.session.user
                document.folder = folder
                document.is_protected = True
                document.save()
            new_post_document = PostDocument()
            new_post_document.document = document
            new_post_document.post = new_post
            new_post_document.save()
        if a["type"] == "questionnaire":
            questionnaire = Questionnaire.objects.get(id=a["id"])
            questionnaire.is_protected = True
            questionnaire.save()
            new_post_questionnaire = PostQuestionnaire()
            new_post_questionnaire.questionnaire = questionnaire
            new_post_questionnaire.post = new_post
            new_post_questionnaire.save()
    return JsonResponse({"success": True}, status=201) 

def amend_post(request, p_id, title, content, post_type, attachments, unit_id, assignment_due_date):
    """
    When you edit/delete a post inside a class, it doesn't get edited/removed
    from database. Instead, we add a new Post which has kind=POST_AMEND_DELETE
    or kind=POST_AMEND_EDIT and is linked to the original post.
    This newer post holds the truth of what we want users to see.
    For example, if it has no PostDocument's associated, then it will be considered
    as if any previously attached documents were removed.
    """
    post = get_from_db(Post, id=p_id)
    if not can_edit_class(request.session.user, post.classroom):
        raise Forbidden
    unit = Unit.objects.filter(id=unit_id).first()
    new_amendment = Post()
    new_amendment.author = request.session.user
    new_amendment.classroom = post.classroom
    new_amendment.amendment_original_post = post
    if post_type == "amend_delete":
        new_amendment.kind = Post.PostKind.AMENDMENT_DELETE
        new_amendment.save()
        __delete_previous_post_documents_and_unprotect_unused_documents(post)
        __delete_previous_post_questionnaires_and_unprotect_unused_questionnaires(post)
    if post_type == "amend_edit":
        new_amendment.kind = Post.PostKind.AMENDMENT_EDIT
        new_amendment.title = title
        new_amendment.content = content
        new_amendment.unit = unit
        new_amendment.assignment_due_date = assignment_due_date
        new_amendment.save()
        __delete_previous_post_documents_and_unprotect_unused_documents(post)
        __delete_previous_post_questionnaires_and_unprotect_unused_questionnaires(post)
        for a in attachments:
            if a["type"] == "document":
                try:
                    document = Document.objects.get(identifier=a["identifier"])
                    document.is_protected = True
                    document.save()
                except Document.DoesNotExist:
                    root_folder = get_or_create_folder(POSTS_DOCUMENTS_ROOT_FOLDER_NAME, request.session.user)
                    folder = get_or_create_folder(__folder_name_for_classroom(post.classroom), request.session.user, root_folder)
                    document = Document()
                    document.identifier = a["identifier"]
                    document.name = a["name"]
                    document.size = a["size"]
                    document.mime_type = a["mime_type"]
                    document.author = request.session.user
                    document.folder = folder
                    document.is_protected = True
                    document.save()
                new_post_document = PostDocument()
                new_post_document.document = document
                new_post_document.post = new_amendment
                new_post_document.save()
        if a["type"] == "questionnaire":
            questionnaire = Questionnaire.objects.get(id=a["id"])
            questionnaire.is_protected = True
            questionnaire.save()
            new_post_questionnaire = PostQuestionnaire()
            new_post_questionnaire.questionnaire = questionnaire
            new_post_questionnaire.post = new_amendment
            new_post_questionnaire.save()
    return JsonResponse({"success": True}, status=201) 
    
def get_assignment(request, a_id):
    assignment = get_from_db(Post, id=a_id, kind=Post.PostKind.ASSIGNMENT)
    newest_amendment = Post.objects.filter(amendment_original_post=assignment).order_by("-id").first()
    if newest_amendment and newest_amendment.kind == Post.PostKind.AMENDMENT_DELETE:
        raise NotFound
    post_documents = PostDocument.objects.filter(post=newest_amendment or assignment)
    files = list(map(lambda pd: document_to_json(pd.document), post_documents))
    post_questionnaires = PostQuestionnaire.objects.filter(post=newest_amendment or assignment)
    questionnaires = list(map(lambda pq: questionnaire_to_json(pq.questionnaire), post_questionnaires))
    for f in files:
        f["type"] = "document"
    for q in questionnaires:
        q["type"] = "questionnaire"
    attachments = files + questionnaires
    class_units = Unit.objects.filter(classroom=assignment.classroom).order_by("name")
    is_teacher = request.session.user.role in [User.UserRole.TEACHER, User.UserRole.TEACHER_LEADER, User.UserRole.TEACHER_SYSADMIN]
    class_students = []
    submits = []
    your_submit = None
    if is_teacher:
        user_class_students = UserClass.objects.filter(classroom=assignment.classroom, user__role=User.UserRole.STUDENT).order_by("user__surname")
        class_students = list(map(lambda uc: uc.user, user_class_students))
        submits = []
        for s in AssignmentSubmit.objects.filter(assignment=assignment):
            submit = {
              "author": user_to_json(s.author),
              "submit_date": s.submit_date,
              "is_score_published": s.is_score_published,
              "comment": s.comment,
              "score": s.score
            }
            submit_documents = AssignmentSubmitDocument.objects.filter(submit=s)
            submit["files"] = list(map(lambda sd: document_to_json(sd.document), submit_documents))
            submits.append(submit)
    else:
        try:
            s = AssignmentSubmit.objects.get(assignment=assignment, author=request.session.user)
            your_submit = {
              "author": user_to_json(s.author),
              "submit_date": s.submit_date,
              "comment": s.comment
            }
            submit_documents = AssignmentSubmitDocument.objects.filter(submit=s)
            your_submit["files"] = list(map(lambda sd: document_to_json(sd.document), submit_documents))
            if s.is_score_published: # Only send score to students if boolean flag says 'published'
                your_submit["is_score_published"] = True
                your_submit["score"] = s.score
        except AssignmentSubmit.DoesNotExist:
            pass
    return JsonResponse(assignment_detail_to_json(assignment, newest_amendment, attachments, is_teacher, class_students, class_units, submits, your_submit)) 

def create_assignment_submit(request, a_id, attachments, comment):
    assignment = get_from_db(Post, id=a_id, kind=Post.PostKind.ASSIGNMENT)
    if not can_see_class(request.session.user, assignment.classroom):
        raise Forbidden
    if AssignmentSubmit.objects.filter(author=request.session.user, assignment=assignment).exists():
        raise ForbiddenAssignmentSubmit
    if timezone.now() > assignment.assignment_due_date:
        raise ForbiddenAssignmentSubmit
    new_submit = AssignmentSubmit()
    new_submit.author = request.session.user
    new_submit.assignment = assignment
    new_submit.comment = comment
    new_submit.save()
    for a in attachments:
        if a["type"] == "document":
            try:
                document = Document.objects.get(identifier=a["identifier"])
                document.is_protected = True
                document.save()
            except Document.DoesNotExist:
                root_folder = get_or_create_folder(ASSIGNMENT_SUBMITS_ROOT_FOLDER_NAME, request.session.user)
                folder = get_or_create_folder(__folder_name_for_group(assignment.classroom.group), request.session.user, root_folder)
                document = Document()
                document.identifier = a["identifier"]
                document.name = a["name"]
                document.size = a["size"]
                document.mime_type = a["mime_type"]
                document.author = request.session.user
                document.folder = folder
                document.is_protected = True
                document.save()
        submit_document = AssignmentSubmitDocument()
        submit_document.document = document
        submit_document.submit = new_submit
        submit_document.save()
    return JsonResponse({"success": True}, status=201)

def score_submit(request, a_id, username, score, should_publish):
    assignment = get_from_db(Post, id=a_id, kind=Post.PostKind.ASSIGNMENT)
    if not can_edit_class(request.session.user, assignment.classroom):
        raise Forbidden
    submit = get_from_db(AssignmentSubmit, author__username=username, assignment=assignment)
    submit.score = score
    submit.is_score_published = should_publish and should_publish == True
    submit.save()
    return JsonResponse({"success": True,
                         "result": {
                             "operation": "score_updated",
                             "author_username": submit.author.username,
                             "score": submit.score,
                             "is_score_published": submit.is_score_published
                         }}, status=200)

def delete_score(request, a_id, username):
    assignment = get_from_db(Post, id=a_id, kind=Post.PostKind.ASSIGNMENT)
    if not can_edit_class(request.session.user, assignment.classroom):
        raise Forbidden
    submit = get_from_db(AssignmentSubmit, author__username=username, assignment=assignment)
    submit.score = None
    submit.is_score_published = False
    submit.save()
    return JsonResponse({"success": True,
                         "result": {
                             "operation": "score_deleted",
                             "author_username": submit.author.username
                         }}, status=200)

def publish_all_scores(request, a_id):
    assignment = get_from_db(Post, id=a_id, kind=Post.PostKind.ASSIGNMENT)
    if not can_edit_class(request.session.user, assignment.classroom):
        raise Forbidden
    all_scored_submits = AssignmentSubmit.objects.filter(assignment=assignment, score__isnull=False)
    all_scored_submits.update(is_score_published=True)
    return JsonResponse({"success": True}, status=200)

def __folder_name_for_classroom(classroom):
    return classroom.group.tag + " - " + classroom.name

def __delete_previous_post_documents_and_unprotect_unused_documents(post):
    old_post_documents = PostDocument.objects.filter(Q(post=post) | Q(post__kind=Post.PostKind.AMENDMENT_EDIT, post__amendment_original_post=post))
    old_documents = list(map(lambda pd: pd.document, old_post_documents))
    old_post_documents.delete()
    for d in old_documents:
        if not is_document_used_in_post_or_announcement(d):
            d.is_protected = False
            d.save()

def __delete_previous_post_questionnaires_and_unprotect_unused_questionnaires(post):
    old_post_questionnaires = PostQuestionnaire.objects.filter(Q(post=post) | Q(post__kind=Post.PostKind.AMENDMENT_EDIT, post__amendment_original_post=post))
    old_questionnaires = list(map(lambda pq: pq.questionnaire, old_post_questionnaires))
    old_post_questionnaires.delete()
    for q in old_questionnaires:
        if not is_questionnaire_used_in_post_or_announcement(q):
            q.is_protected = False
            q.save()
