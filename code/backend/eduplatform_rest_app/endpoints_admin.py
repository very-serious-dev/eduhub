import bcrypt, json, re
from django.http import JsonResponse
from .models import EPUser, EPGroup, EPClass, EPTeacher, EPStudent, EPTeacherClass, EPStudentClass
from .serializers import groups_array_to_json, classes_array_to_json, students_array_to_json, teachers_array_to_json

def home(request):
    if request.method == "GET":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        users_count = EPUser.objects.all().count()
        classes_count = EPClass.objects.all().count()
        serialized_groups = []
        groups = EPGroup.objects.all()
        return JsonResponse({"usersCount": users_count,
                             "classesCount": classes_count,
                             "groups": groups_array_to_json(groups) })
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
    
def handle_users(request):
    if request.method == "GET":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        serialized_users = []
        teachers = EPTeacher.objects.all()
        students = EPStudent.objects.all()
        users = [*teachers_array_to_json(teachers), *students_array_to_json(students)]
        return JsonResponse({"users": users})
    elif request.method == "POST":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_username = body_json.get("username")
        json_name = body_json.get("name")
        json_surname = body_json.get("surname")
        json_password = body_json.get("password")
        json_student_group = body_json.get("student_group")
        json_is_teacher = body_json.get("is_teacher", False)
        if json_username is None or json_name is None or json_surname is None or json_password is None:
            return JsonResponse({"error": "Falta username, name, surname o password en el cuerpo de la petición"}, status=400)
        if not(re.match("^[a-z0-9.]+$", json_username)):
            return JsonResponse({"error": "El nombre de usuario no es válido. Sólo puede contener letras en minúscula, dígitos y puntos (.)"}, status=409)
        if EPUser.objects.filter(username=json_username).exists():
            return JsonResponse({"error": "Ese usuario ya está registrado"}, status=409)
        new_user = EPUser()
        new_user.username = json_username
        new_user.name = json_name
        new_user.surname = json_surname
        new_user.encrypted_password = bcrypt.hashpw(json_password.encode('utf8'), bcrypt.gensalt()).decode('utf8')
        
        if json_is_teacher:
            new_teacher = EPTeacher()
            new_teacher.user = new_user
            new_user.save()
            new_teacher.save()
        elif json_student_group is not None:
            try:
                group = EPGroup.objects.get(tag=json_student_group)
            except EPGroup.DoesNotExist:
                return JsonResponse({"error": "El grupo especificado no existe"}, status=409)
            new_student = EPStudent()
            new_student.user = new_user
            new_student.group = group
            new_user.save()
            new_student.save()
        else:
            # School leader and Sysadmin must be manually added
            # Thus, if execution reaches here, request was incorrect
            return JsonResponse({"error": "Falta student_group o is_teacher"}, status=400)
        
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)


def handle_groups(request):
    if request.method == "POST":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_tag = body_json.get("tag")
        json_name = body_json.get("name")
        json_year = body_json.get("year")
        json_tutor_username = body_json.get("tutor_username")
        if json_tag is None or json_name is None or json_tutor_username is None or json_year is None:
            return JsonResponse({"error": "Falta tag, name, year o tutor_username en el cuerpo de la petición"}, status=400)
        if not(re.match("^[A-Za-z0-9]+$", json_tag)):
            return JsonResponse({"error": "El tag no es válido. Sólo puede contener letras y dígitos"}, status=409)
        if not(re.match("^[0-9-]+$", json_year)):
            return JsonResponse({"error": "Año inválido. Sólo puede contener dígitos y guiones"}, status=409)
        if EPGroup.objects.filter(tag=json_tag, year=json_year).exists():
            return JsonResponse({"error": "Ese grupo ya está registrado"}, status=409)
        if EPUser.objects.filter(username=json_tutor_username).exists() == False:
            return JsonResponse({"error": "El tutor indicado no existe"}, status=409)
        new_group = EPGroup()
        new_group.tag = json_tag
        new_group.name = json_name
        new_group.year = json_year
        new_group.tutor = EPTeacher.objects.get(user__username=json_tutor_username)
        new_group.save()
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
    
def handle_classes(request):
    if request.method == "GET":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        classes = EPClass.objects.all()
        return JsonResponse({"classes": classes_array_to_json(classes) })
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def add_teacher_to_class(request, classId):
    if request.method == "POST":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_username = body_json.get("username")
        if json_username is None:
            return JsonResponse({"error": "Falta username en el cuerpo de la petición"}, status=400)
        try:
            cls = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase no existe"}, status=404)
        try:
            teacher = EPTeacher.objects.get(user__username=json_username)
        except EPTeacher.DoesNotExist:
            return JsonResponse({"error": "No existe el usuario especificado"}, status=404)
        if EPTeacherClass.objects.filter(teacher=teacher, classroom=cls).exists():
            return JsonResponse({"error": "El usuario ya pertenece a esa clase"}, status=409)
        new_teacher_class = EPTeacherClass()
        new_teacher_class.teacher = teacher
        new_teacher_class.classroom = cls
        new_teacher_class.save()
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def add_students_to_class(request, classId):
    if request.method == "POST":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_username = body_json.get("username")
        if json_username is None:
            return JsonResponse({"error": "Falta username en el cuerpo de la petición"}, status=400)
        try:
            cls = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase no existe"}, status=404)
        failed_inexistent_users = []
        failed_already_added_users = []
        for non_trimmed_username in json_username.split(","):
            username = non_trimmed_username.strip()
            try:
                student = EPStudent.objects.get(user__username=username)
                if EPStudentClass.objects.filter(student=student, classroom=cls).exists():
                    failed_already_added_users.append(username)
                new_student_class = EPStudentClass()
                new_student_class.student = student
                new_student_class.classroom = cls
                new_student_class.save()
            except EPStudent.DoesNotExist:
                failed_inexistent_users.append(username)
        if len(failed_inexistent_users) == 0 and (failed_already_added_users) == 0:
            return JsonResponse({"success": True}, status=201)
        else:
            error_msg = ""
            if len(failed_inexistent_users) > 0:
                error_msg += "Estudiante(s) inexistente(s): " + ", ".join(failed_inexistent_users) + ". "
            if len(failed_already_added_users) > 0:
                error_msg += "Estudiante(s) ya pertenece(n) a la clase: " + ", ".join(failed_already_added_users)
            return JsonResponse({"partial_success": True, "error": error_msg}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def get_teachers(request):
    if request.method == "GET":
        admin_auth_error = __admin_auth_json_error_response(request)
        if admin_auth_error is not None:
            return admin_auth_error
        teachers = EPTeacher.objects.all()
        return JsonResponse({"teachers": teachers_array_to_json(teachers) })
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
    
def __admin_auth_json_error_response(request):
    if request.user is None:
        return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
    try:
        teacher = EPTeacher.objects.get(user=request.user)
        if teacher.is_sysadmin == False and teacher.is_school_leader == False:
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
    except EPTeacher.DoesNotExist:
        return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
    return None
