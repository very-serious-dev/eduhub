import json
from django.http import JsonResponse
from .models import EPTeacherClass, EPStudentClass, EPClass, EPTeacher, EPGroup
from .serializers import classes_array_to_json, teachers_array_to_json, students_array_to_json

def handle_classes(request):
    if request.method == "GET":
        if request.user is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)    
        try:
            # Teacher - We check EPTeacherClass
            teacher = EPTeacher.objects.get(user=request.user)
            user_classes = EPTeacherClass.objects.filter(teacher__user=request.user, classroom__archived=False)
        except EPTeacher.DoesNotExist:
            # Student - We check EPStudentClass
            user_classes = EPStudentClass.objects.filter(student__user=request.user, classroom__archived=False)
        classes = map(lambda uc: uc.classroom, user_classes)
        return JsonResponse({"classes": classes_array_to_json(classes)})
    elif request.method == "POST":
        teacher_auth_error = __teacher_auth_json_error_response(request)
        if teacher_auth_error is not None:
            return teacher_auth_error
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_name = body_json.get("name")
        json_group = body_json.get("group")
        json_automatically_add_teacher = body_json.get("automaticallyAddTeacher")
        if json_name is None or json_group is None:
            return JsonResponse({"error": "Falta name o group en el cuerpo de la petición"}, status=400)
        if EPGroup.objects.filter(tag=json_group).exists() == False:
            return JsonResponse({"error": "El grupo indicado al que debe pertenecer la clase no existe"}, status=409)
        new_class = EPClass()
        new_class.name = json_name
        new_class.group = EPGroup.objects.get(tag=json_group)
        new_class.save()
        if json_automatically_add_teacher is True:
            teacher = EPTeacher.objects.get(user=request.user) # We can do this safely, already verified in __teacher_auth_json_error_response
            new_teacher_class = EPTeacherClass()
            new_teacher_class.teacher = teacher
            new_teacher_class.classroom = new_class
            new_teacher_class.save()
        # TO-DO: Feature: Automatically add to the new class all users belonging to group
        return JsonResponse({"success": True}, status=201)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
        
def handle_class_detail(request, classId):
    if request.method == "GET":
        if request.user is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        try:
            teacher = EPTeacher.objects.get(user=request.user)
            isClassEditableByUser = EPTeacherClass.objects.filter(teacher=teacher, classroom=classroom).count() > 0
        except EPTeacher.DoesNotExist:
            isClassEditableByUser = False
        
        # TO-DO: Mock!
        response = JsonResponse({"id": classId,
                                 "name": classroom.name,
                                 "entries": [{"published_date": "2024-09-17 11:31",
                                              "author": "Test",
                                              "content": "Mañana en clase hablaremos de las fechas de los exámenes parciales"}, 
                                              {"published_date": "2024-09-14 07:42",
                                              "author": "Test",
                                              "content": "Por favor, enviadme un mensaje el número de serie de vuestro ordenador. Para sacar el número de serie, podéis ejecutar\n\n>wmic bios get serialnumber\n\n...desde un terminal. ¡Un saludo!"}, 
                                              {"published_date": "2024-09-12 14:30",
                                              "author": "Test",
                                              "content": "El centro permanecerá cerrado por festivo el próximo 7 de octubre"}, 
                                              {"published_date": "2024-09-12 09:41",
                                              "author": "Test",
                                              "content": "Recordad solicitar las habilitaciones para:\n\n- FOL\n- EIE\n\n¡Gracias!"}, 
                                              {"published_date": "2024-09-12 09:45",
                                              "author": "Test",
                                              "content": "La plataforma de Classroom dejará de funcionar próximamente.\nPor favor, pasad todos vuestros datos a Eduplatform"}, 
                                              {"published_date": "2024-09-11 08:30",
                                              "author": "Test",
                                              "content": "¡Da comienzo el nuevo curso! ¡Bienvenidos! Recordad que las clases empiezan el próximo lunes"}],
                                 "shouldShowEditButton": isClassEditableByUser })
        return response  
    elif request.method == "PUT":
        if request.user is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        try:
            teacher = EPTeacher.objects.get(user=request.user)
            if EPTeacherClass.objects.filter(teacher=teacher, classroom=classroom).count() == 0:
                return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        except EPTeacher.DoesNotExist:
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        try:
            body_json = json.loads(request.body)
        except JSONDecodeError:
            return JsonResponse({"error": "Cuerpo de la petición incorrecto"}, status=400)
        json_name = body_json.get("name")
        if json_name is None:
            return JsonResponse({"error": "Falta name en el cuerpo de la petición"}, status=400)
        classroom.name = json_name
        classroom.save()
        return JsonResponse({"success": True}, status=200)
    elif request.method == "DELETE":
        if request.user is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        try:
            teacher = EPTeacher.objects.get(user=request.user)
            if EPTeacherClass.objects.filter(teacher=teacher, classroom=classroom).count() == 0:
                return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        except EPTeacher.DoesNotExist:
            return JsonResponse({"error": "No tienes permisos para llevar a cabo esa acción"}, status=403)
        classroom.archived = True
        classroom.save()
        return JsonResponse({"success": True}, status=200)
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)

def handle_class_participants(request, classId):
    if request.method == "GET":
        if request.user is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        try:
            classroom = EPClass.objects.get(id=classId)
        except EPClass.DoesNotExist:
            return JsonResponse({"error": "La clase que buscas no existe"}, status=404)
        teachers_class = EPTeacherClass.objects.filter(classroom=classroom)
        students_class = EPStudentClass.objects.filter(classroom=classroom)
        teachers = list(map(lambda tc: tc.teacher, teachers_class))
        students = list(map(lambda sc: sc.student, students_class))
        user_belongs_to_class = False
        for x in [*teachers, *students]:
            if x.user_id == request.user.id:
                user_belongs_to_class = True
                break
        if not(user_belongs_to_class):
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        return JsonResponse({"teachers": teachers_array_to_json(teachers), "students": students_array_to_json(students)}, status=200)
        
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
            
def __teacher_auth_json_error_response(request):
    if request.user is None:
        return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
    try:
        teacher = EPTeacher.objects.get(user=request.user)
        return None
    except EPTeacher.DoesNotExist:
        return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
    return None
