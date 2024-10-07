import json
from django.http import JsonResponse
from .models import EPTeacherClass, EPStudentClass, EPClass, EPTeacher

def handle_classes(request):
    if request.method == "GET":
        if request.user is None:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)    
        try:
			# Teacher - We check EPTeacherClass
		    teacher = EPTeacher.objects.get(user=request.user)
		    user_classes = EPTeacherClass.objects.filter(teacher__user=request.user)
	    except EPTeacher.DoesNotExist:
		    # Student - We check EPStudentClass
            user_classes = EPStudentClass.objects.filter(student__user=request.user)
        serialized_classes = []
        for uc in user_classes:
            serialized_classes.append(uc.classroom.to_json_obj())
        response = JsonResponse({"classes": serialized_classes})
        return response  
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
        teachers = []
        for tc in EPTeacherClass.objects.filter(classroom=classroom):
            teachers.append(tc.teacher.to_json_obj())
        # TO-DO: Mock
        if len(teachers) == 0:
            teachers = [{"username": "prueba", "name": "Prueba", "surname": "Prueba1"}]
        # TO-DO: Mock!
        response = JsonResponse({"name": classroom.name,
                                 "entries": [{"published_date": "2024-09-17 11:31",
                                              "author": teachers[0]["username"],
                                              "content": "Mañana en clase hablaremos de las fechas de los exámenes parciales"}, 
                                              {"published_date": "2024-09-14 07:42",
                                              "author": teachers[0]["username"],
                                              "content": "Por favor, enviadme un mensaje el número de serie de vuestro ordenador. Para sacar el número de serie, podéis ejecutar\n\n>wmic bios get serialnumber\n\n...desde un terminal. ¡Un saludo!"}, 
                                              {"published_date": "2024-09-12 14:30",
                                              "author": teachers[0]["username"],
                                              "content": "El centro permanecerá cerrado por festivo el próximo 7 de octubre"}, 
                                              {"published_date": "2024-09-12 09:41",
                                              "author": teachers[0]["username"],
                                              "content": "Recordad solicitar las habilitaciones para:\n\n- FOL\n- EIE\n\n¡Gracias!"}, 
                                              {"published_date": "2024-09-12 09:45",
                                              "author": teachers[0]["username"],
                                              "content": "La plataforma de Classroom dejará de funcionar próximamente.\nPor favor, pasad todos vuestros datos a Eduplatform"}, 
                                              {"published_date": "2024-09-11 08:30",
                                              "author": teachers[0]["username"],
                                              "content": "¡Da comienzo el nuevo curso! ¡Bienvenidos! Recordad que las clases empiezan el próximo lunes"}],
                                 "teachers": teachers })
        return response  
    else:
        return JsonResponse({"error": "Unsupported"}, status=405)
