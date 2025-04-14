import json, random
from datetime import datetime
from django.http import JsonResponse, HttpResponse
from .models import User, Class, UserClass, Group, Unit, Post, AssignmentSubmit
from .serializers import groups_array_to_json, classes_array_to_json, users_array_to_json, class_detail_to_json

# TO-DO: Improve some CTRL+C, CTRL+V in privileges check throughout this file

def get_all_groups(request):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        groups = Group.objects.all()
        return JsonResponse({"groups": groups_array_to_json(groups) })  
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def handle_classes(request):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        users_classes = UserClass.objects.filter(user=request.session.user, classroom__archived=False)
        classes = list(map(lambda uc: uc.classroom, users_classes))
        return JsonResponse({"classes": classes_array_to_json(classes)})
    elif request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        if request.session.user.role not in [User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_name = body_json.get("name")
        json_group = body_json.get("group")
        json_automatically_add_teacher = body_json.get("automaticallyAddTeacher")
        if json_name is None or json_group is None:
            return JsonResponse({"error": "Falta name o group en el cuerpo de la petición"}, status=400)
        if Group.objects.filter(tag=json_group).exists() == False:
            return JsonResponse({"error": "El grupo indicado al que debe pertenecer la clase no existe"}, status=409)
        new_class = Class()
        new_class.name = json_name
        new_class.group = Group.objects.get(tag=json_group)
        new_class.theme = Class.ClassTheme.BLUE
        new_class.save()
        if json_automatically_add_teacher is True:
            new_user_class = UserClass()
            new_user_class.user = request.session.user
            new_user_class.classroom = new_class
            new_user_class.save()
        # TO-DO: Feature: Automatically add to the new class all users belonging to group
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
        
def handle_class_detail(request, classId):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = Class.objects.get(id=classId)
        except Class.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        # TO-DO: 401 if one student is accessing a class where he/she doesn't belong!
        if request.session.user.role not in [User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            isClassEditableByUser = False
        else:
            isClassEditableByUser = UserClass.objects.filter(user=request.session.user, classroom=classroom).count() > 0
        only_newer_than_post_with_id = request.GET.get("newerThanPostWithId", None)
        return JsonResponse(class_detail_to_json(classroom, isClassEditableByUser, only_newer_than_post_with_id))
    elif request.method == "PUT":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = Class.objects.get(id=classId)
        except Class.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role not in [User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            # Student - can't edit classes
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        if request.session.user.role == User.UserRole.TEACHER and UserClass.objects.filter(user=request.session.user, classroom=classroom).count() == 0:
            # Regular teacher trying to edit another teacher's class
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_name = body_json.get("name")
        if json_name is None:
            return JsonResponse({"error": "Falta name en el cuerpo de la petición"}, status=400)
        classroom.name = json_name
        classroom.save()
        return JsonResponse({"success": True}, status=200)
    elif request.method == "DELETE":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = Class.objects.get(id=classId)
        except Class.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role not in [User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            # Student - can't edit classes
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        if request.session.user.role == User.UserRole.TEACHER and UserClass.objects.filter(user=user, classroom=classroom).count() == 0:
            # Regular teacher trying to edit another teacher's class
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        classroom.archived = True
        classroom.save()
        return JsonResponse({"success": True}, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def handle_class_participants(request, classId):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = Class.objects.get(id=classId)
        except Class.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        users_class = UserClass.objects.filter(classroom=classroom)
        if request.session.user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            has_permission_to_see = True
        else:
            has_permission_to_see = users_class.filter(user=request.session.user).exists()
        if not(has_permission_to_see):
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        users = list(map(lambda uc: uc.user, users_class))
        return JsonResponse({"users": users_array_to_json(users)}, status=200)
    elif request.method == "PUT":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = Class.objects.get(id=classId)
        except Class.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role == User.UserRole.STUDENT:
            has_permission_to_edit = False
        elif request.session.user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            has_permission_to_edit = True
        else: # Regular teacher
            has_permission_to_edit = UserClass.objects.filter(classroom=classroom, user=request.session.user).exists()
        if not(has_permission_to_edit):
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_username = body_json.get("username")
        if json_username is None:
            return JsonResponse({"error": "Falta username en el cuerpo de la petición"}, status=400)
        non_trimmed_usernames = json_username.split(",")
        usernames = list(map(lambda x: x.strip(), non_trimmed_usernames))
        failed_inexistent_users = []
        failed_already_added_users = []
        for username in usernames:
            if len(username) > 0:
                try:
                    user = User.objects.get(username=username)
                    if UserClass.objects.filter(user=user, classroom=classroom).exists():
                        failed_already_added_users.append(username)
                    else:
                        new_user_class = UserClass()
                        new_user_class.user = user
                        new_user_class.classroom = classroom
                        new_user_class.save()
                except User.DoesNotExist:
                    failed_inexistent_users.append(username)
        if len(failed_inexistent_users) == 0 and len(failed_already_added_users) == 0:
            return JsonResponse({"success": True}, status=201)
        else:
            error_msg = ""
            if len(failed_inexistent_users) > 0:
                error_msg += "Usuario(s) inexistente(s): " + ", ".join(failed_inexistent_users) + ". "
            if len(failed_already_added_users) > 0:
                error_msg += "Usuario(s) ya pertenece(n) a la clase: " + ", ".join(failed_already_added_users)
            return JsonResponse({"partial_success": True, "error": error_msg}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def delete_class_participant(request, classId, username):
    if request.method == "DELETE":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = Class.objects.get(id=classId)
        except Class.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role == User.UserRole.STUDENT:
            has_permission_to_edit = False
        elif request.session.user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            has_permission_to_edit = True
        else: # Regular teacher
            has_permission_to_edit = UserClass.objects.filter(classroom=classroom, user=request.session.user).exists()
        if not(has_permission_to_edit):
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        try:
            user_class = UserClass.objects.get(classroom=classroom, user__username=username)
            user_class.delete()
            return JsonResponse({"success": True}, status=200)
        except UserClass.DoesNotExist:
            return JsonResponse({"error": "El usuario no pertenece a esa clase"}, status=404)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def create_class_unit(request, classId):
    if request.method == "POST":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = Class.objects.get(id=classId)
        except Class.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role == User.UserRole.STUDENT:
            has_permission_to_edit = False
        elif request.session.user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            has_permission_to_edit = True
        else: # Regular teacher
            has_permission_to_edit = UserClass.objects.filter(classroom=classroom, user=request.session.user).exists()
        if not(has_permission_to_edit):
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        try:
            body_json = json.loads(request.body)
        except json.decoder.JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_name = body_json.get("name")
        if json_name is None:
            return JsonResponse({"error": "Falta name en el cuerpo de la petición"}, status=400)
        try:
            Unit.objects.get(classroom=classroom, name=json_name)
            return JsonResponse({"error": "Ya existe una clase con ese nombre"}, status=409)
        except Unit.DoesNotExist:
            # Doesn't exist, create it
            new_unit = Unit()
            new_unit.name = json_name
            new_unit.classroom = classroom
            new_unit.save()
            return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def handle_class_unit(request, classId, unitId):
    if request.method in ["PUT", "DELETE"]:
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = Class.objects.get(id=classId)
        except Class.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role == User.UserRole.STUDENT:
            has_permission_to_edit = False
        elif request.session.user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            has_permission_to_edit = True
        else: # Regular teacher
            has_permission_to_edit = UserClass.objects.filter(classroom=classroom, user=request.session.user).exists()
        if not(has_permission_to_edit):
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        try:
            unit = Unit.objects.get(id=unitId)
            if request.method == "PUT":
                try:
                    body_json = json.loads(request.body)
                except json.decoder.JSONDecodeError:
                    return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
                json_name = body_json.get("name")
                if json_name is None:
                    return JsonResponse({"error": "Falta name en el cuerpo de la petición"}, status=400)
                unit.name = json_name
                unit.save()
                return JsonResponse({"success": True}, status=200)
            elif request.method == "DELETE":
                unit.delete()
                return JsonResponse({"success": True}, status=200)
            else:
                return JsonResponse({"error": "Server error"}, status=500)
        except Unit.DoesNotExist:
            return JsonResponse({"error": "No existe ese tema"}, status=404)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def download_scores(request, classId):
    if request.method == "GET":
        if request.session is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = Class.objects.get(id=classId)
        except Class.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        if request.session.user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER]:
            has_permission_to_see = True
        else:
            regular_teachers_in_class = UserClass.objects.filter(classroom=classroom, user__role__in=[User.UserRole.TEACHER])
            has_permission_to_see = request.session.user in regular_teachers_in_class
        if not(has_permission_to_see):
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        csv = ""
        original_assignments = Post.objects.filter(classroom=classroom, kind=Post.PostKind.ASSIGNMENT)
        assignments = []
        for oa in original_assignments:
            assignment_real_title = oa.title
            if Post.objects.filter(amendment_original_post=oa).count() > 0:
                newest_amendment = Post.objects.filter(amendment_original_post=oa).order_by("-id")[0]
                if newest_amendment.kind == Post.PostKind.AMENDMENT_DELETE:
                    continue
                elif newest_amendment.kind == Post.PostKind.AMENDMENT_EDIT:
                    assignment_real_title = newest_amendment.title
            assignments.append({"assignment": oa, "real_title": assignment_real_title})
        for a in assignments:
            csv += "," + a["real_title"] # FIXME, commas in assignment titles will break this?
        csv += "\n"
        students_class = UserClass.objects.filter(classroom=classroom, user__role__in=[User.UserRole.STUDENT]).order_by("user__surname")
        students = list(map(lambda sc: sc.user, students_class))
        for s in students:
            csv += '"'+ s.surname + ', ' + s.name + '"'
            for a in assignments:
                try:
                    submit = AssignmentSubmit.objects.get(author=s, assignment=a["assignment"], score__isnull=False)
                    score = submit.score
                except AssignmentSubmit.DoesNotExist:
                    score = ""
                csv += "," + str(score)
            csv += "\n"
        response = HttpResponse(csv, content_type="text/csv")
        response["Content-Disposition"] = "filename=Notas de " + classroom.name + " [" + classroom.group.tag + "] (" + datetime.today().strftime('%d-%m-%Y') + "]";
        return response
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
