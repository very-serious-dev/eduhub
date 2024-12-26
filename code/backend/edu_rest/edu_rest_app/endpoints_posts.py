import json
from django.http import JsonResponse
from .models import Class, UserClass, Unit, Post, Document, PostDocument, AssignmentSubmit, AssignmentSubmitDocument
from .models import USER_STUDENT, USER_TEACHER, USER_TEACHER_SYSADMIN, USER_TEACHER_LEADER, POST_PUBLICATION, POST_ASSIGNMENT, POST_AMEND_DELETE, POST_AMEND_EDIT
from .serializers import assignment_detail_to_json

def create_post(request, classId):
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = Class.objects.get(id=classId)
        except Class.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role not in [USER_TEACHER, USER_TEACHER_SYSADMIN, USER_TEACHER_LEADER]:
            # Student - can't create posts inside a class
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        if request.session.user.role == USER_TEACHER and UserClass.objects.filter(user=request.session.user, classroom=classroom).count() == 0:
            # Regular teacher trying to post on another teacher's class
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_title = body_json.get("title")
        json_unit_id = body_json.get("unit_id")
        json_content = body_json.get("content")
        json_post_type = body_json.get("post_type")
        json_assignment_due_date = body_json.get("assignment_due_date")
        json_files = body_json.get("files")
        if json_title is None or json_content is None or json_post_type is None:
            return JsonResponse({"error": "Falta title, content o post_type en el cuerpo de la petición"}, status=400)
        if json_post_type not in ["publication", "assignment"]:
            return JsonResponse({"error": "post_type inválido"}, status=400)
        if json_unit_id is None:
            unit = None
        else:
            try:
                unit = Unit.objects.get(id=json_unit_id)
            except Unit.DoesNotExist:
                return JsonResponse({"error": "No existe un tema con ese id"}, status=404)
        new_post = Post()
        new_post.title = json_title
        new_post.content = json_content
        new_post.unit = unit
        new_post.classroom = classroom
        new_post.author = request.session.user
        if json_post_type == "publication":
            new_post.kind = POST_PUBLICATION
        elif json_post_type == "assignment":
            new_post.kind = POST_ASSIGNMENT
            new_post.assignment_due_date = json_assignment_due_date
        new_post.save()
        if json_files is not None:
            for f in json_files:
                document = Document()
                document.identifier = f["identifier"]
                document.name = f["name"]
                document.size = f["size"]
                document.mime_type = f["mime_type"]
                document.author = request.session.user
                document.save()
                post_document = PostDocument()
                post_document.document = document
                post_document.post = new_post
                post_document.save()
        return JsonResponse({"success": True}, status=201) 
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def amend_post(request, postId):
    # When you edit/delete a post inside a class, it doesn't get edited/removed
    # from database. Instead, we add a new Post row which has kind=POST_AMEND_DELETE
    # or kind=POST_AMEND_EDIT and is linked to the original post.
    # This newer post holds the truth of what we want users to see.
    # For example, if it has no PostDocument's associated, then it will be considered
    # as if any previously attached documents were removed.
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            post = Post.objects.get(id=postId)
        except Post.DoesNotExist:
            return JsonResponse({"error": "El post que buscas no existe"}, status=404)
        if request.session.user.role not in [USER_TEACHER, USER_TEACHER_SYSADMIN, USER_TEACHER_LEADER]:
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        if request.session.user.role == USER_TEACHER and request.session.user != post.author:
            # Regular teacher trying to edit/remove another teacher's publication
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_title = body_json.get("title")
        json_unit_id = body_json.get("unit_id")
        json_content = body_json.get("content")
        json_post_type = body_json.get("post_type")
        json_assignment_due_date = body_json.get("assignment_due_date")
        json_files = body_json.get("files")
        if json_unit_id is None:
            unit = None
        else:
            try:
                unit = Unit.objects.get(id=json_unit_id)
            except Unit.DoesNotExist:
                return JsonResponse({"error": "No existe un tema con ese id"}, status=404)
        if json_post_type == "amend_delete":
            new_amend = Post()
            new_amend.kind = POST_AMEND_DELETE
            new_amend.author = request.session.user
            new_amend.classroom = post.classroom
            new_amend.amend_original_post = post
            new_amend.save()
            return JsonResponse({"success": True}, status=201) 
        elif json_post_type == "amend_edit":
            new_amend = Post()
            new_amend.kind = POST_AMEND_EDIT
            new_amend.author = request.session.user
            new_amend.classroom = post.classroom
            new_amend.amend_original_post = post
            new_amend.title = json_title
            new_amend.content = json_content
            new_amend.unit = unit
            new_amend.assignment_due_date = json_assignment_due_date
            if json_files is None:
                new_amend.amend_changes_documents = False
            else:
                new_amend.amend_changes_documents = True
                for f in json_files:
                    document = Document()
                    document.identifier = f["identifier"]
                    document.name = f["name"]
                    document.size = f["size"]
                    document.mime_type = f["mime_type"]
                    document.author = request.session.user
                    document.save()
                    post_document = PostDocument()
                    post_document.document = document
                    post_document.post = new_amend
                    post_document.save()
            new_amend.save()
            return JsonResponse({"success": True}, status=201) 
        else:
            return JsonResponse({"error": "post_type inválido"}, status=400)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
    
def assignment_detail(request, assignmentId):
    if request.method == "GET":
        if request.session is None: # FIX-ME: So much CTRL+C CTRL+V :(
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            assignment = Post.objects.get(id=assignmentId, kind=POST_ASSIGNMENT)
        except Post.DoesNotExist:
            return JsonResponse({"error": "La tarea que buscas no existe"}, status=404)
        canView = False
        if request.session.user.role in [USER_TEACHER_SYSADMIN, USER_TEACHER_LEADER]:
            canView = True
        if request.session.user.role in [USER_STUDENT, USER_TEACHER]:
            canView = UserClass.objects.filter(user=request.session.user, classroom=assignment.classroom).count() > 0
        if canView == False:
            return JsonResponse({"error": "No tienes permisos para ver esta tarea"}, status=403)
        return JsonResponse(assignment_detail_to_json(assignment, request.session.user)) 
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def create_assignment_submit(request, assignmentId):
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            assignment = Post.objects.get(id=assignmentId, kind=POST_ASSIGNMENT)
        except Post.DoesNotExist:
            return JsonResponse({"error": "La tarea que buscas no existe"}, status=404)
        if request.session.user.role not in [USER_STUDENT]:
            # Not a student - prevent from making a submit
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        if UserClass.objects.filter(user=request.session.user, classroom=assignment.classroom).count() == 0:
            # Student doesn't belong to assignment's class
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        # TODO: Don't allow submits beyond due date
        # (Already disallowed client-side)
        if AssignmentSubmit.objects.filter(author=request.session.user, assignment=assignment).count() > 0:
            # Trying to submit an already submitted task
            return JsonResponse({"error": "No puedes entregar una tarea dos veces"}, status=409)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_comment = body_json.get("comment")
        json_files = body_json.get("files")
        new_submit = AssignmentSubmit()
        new_submit.author = request.session.user
        new_submit.assignment = assignment
        if json_comment is not None:
            new_submit.comment = json_comment
        new_submit.save()
        if json_files is not None:
            for f in json_files:
                document = Document()
                document.identifier = f["identifier"]
                document.name = f["name"]
                document.size = f["size"]
                document.mime_type = f["mime_type"]
                document.author = request.session.user
                document.save()
                submit_document = AssignmentSubmitDocument()
                submit_document.document = document
                submit_document.submit = new_submit
                submit_document.save()
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
