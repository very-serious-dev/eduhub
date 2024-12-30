import json
from django.http import JsonResponse
from django.db.models import Q
from .models import User, Class, UserClass, Unit, Post, Document, PostDocument, AssignmentSubmit, AssignmentSubmitDocument
from .serializers import assignment_detail_to_json

def create_post(request, classId):
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = Class.objects.get(id=classId)
        except Class.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role not in [User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            # Student - can't create posts inside a class
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        if request.session.user.role == User.UserRole.TEACHER and UserClass.objects.filter(user=request.session.user, classroom=classroom).count() == 0:
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
            new_post.kind = Post.PostKind.PUBLICATION
        elif json_post_type == "assignment":
            new_post.kind = Post.PostKind.ASSIGNMENT
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
                #FIX-ME: Probably it's now breaking since I introduced 'folder' attribute
                #TODO: Make (if not exists) a new folder with the class name and put files into it
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
        if request.session.user.role not in [User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        if request.session.user.role == User.UserRole.TEACHER and request.session.user != post.author:
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
            new_amendment = Post()
            new_amendment.kind = Post.PostKind.AMENDMENT_DELETE
            new_amendment.author = request.session.user
            new_amendment.classroom = post.classroom
            new_amendment.amendment_original_post = post
            new_amendment.save()
            return JsonResponse({"success": True}, status=201) 
        elif json_post_type == "amend_edit":
            new_amendment = Post()
            new_amendment.kind = Post.PostKind.AMENDMENT_EDIT
            new_amendment.author = request.session.user
            new_amendment.classroom = post.classroom
            new_amendment.amendment_original_post = post
            new_amendment.title = json_title
            new_amendment.content = json_content
            new_amendment.unit = unit
            new_amendment.assignment_due_date = json_assignment_due_date
            new_amendment.save()
            if json_files is not None:
                # NICE-TO-HAVE: Maybe implement a better way of amending
                # attached documents? Now, if you have
                #
                # POST 1           -> Docs A, B, C <-- These aren't used anymore
                # POST 1 amendment -> Docs A, B        since the amendment establishes
                #                                      new PostDocument rows that prevail
                for f in json_files:
                    try:
                        document = Document.objects.get(identifier=f["identifier"])
                    except Document.DoesNotExist:
                        document = Document()
                        document.identifier = f["identifier"]
                        document.name = f["name"]
                        document.size = f["size"]
                        document.mime_type = f["mime_type"]
                        document.author = request.session.user
                        document.save()
                    post_document = PostDocument()
                    post_document.document = document
                    post_document.post = new_amendment
                    post_document.save()
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
            assignment = Post.objects.get(id=assignmentId, kind=Post.PostKind.ASSIGNMENT)
        except Post.DoesNotExist:
            return JsonResponse({"error": "La tarea que buscas no existe"}, status=404)
        newest_amendment = None
        if Post.objects.filter(amendment_original_post=assignment).count() > 0:
            newest_amendment = Post.objects.filter(amendment_original_post=assignment).order_by("-id")[0]
            if newest_amendment.kind == Post.PostKind.AMENDMENT_DELETE:
                return JsonResponse({"error": "La tarea que buscas no existe"}, status=404)
        canView = False
        if request.session.user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            canView = True
        if request.session.user.role in [User.UserRole.STUDENT, User.UserRole.TEACHER]:
            canView = UserClass.objects.filter(user=request.session.user, classroom=assignment.classroom).count() > 0
        if canView == False:
            return JsonResponse({"error": "No tienes permisos para ver esta tarea"}, status=403)
        return JsonResponse(assignment_detail_to_json(assignment, newest_amendment, request.session.user)) 
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def create_assignment_submit(request, assignmentId):
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            assignment = Post.objects.get(id=assignmentId, kind=Post.PostKind.ASSIGNMENT)
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
