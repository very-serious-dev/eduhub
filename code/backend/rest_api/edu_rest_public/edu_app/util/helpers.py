import json, re
from django.http import JsonResponse
from . import exceptions as e
from ..models import User, Folder, UserClass, AnnouncementDocument, PostDocument, AnnouncementQuestionnaire, PostQuestionnaire, UserQuestionnairePermission, Post, ChoicesQuestion, ChoicesQuestionChoice, ChoicesQuestionAnswer, Class

def maybe_unhappy(endpoint_function):
    def wrapped(*args, **kwargs):
        try:
            return endpoint_function(*args, **kwargs)
        except e.BadRequest:
            return JsonResponse({"error": "La petición no es válida o faltan parámetros"}, status=400)
        except e.BadRequestInvalidPassword:
            return JsonResponse({"error": "La contraseña debe tener por lo menos 8 caracteres"}, status=400)
        except e.BadRequestInvalidUsername:
            return JsonResponse({"error": "El nombre de usuario no es válido. Sólo puede contener letras en minúscula, dígitos y puntos (.)"}, status=400)
        except e.BadRequestInvalidTag:
            return JsonResponse({"error": "El tag no es válido. Sólo puede contener letras y dígitos"}, status=400)
        except e.BadRequestInvalidYear:
            return JsonResponse({"error": "Año inválido. Sólo puede contener dígitos y guiones"}, status=400)
        except e.BadRequestIllegalMove:
            return JsonResponse({"error": "No puedes mover una carpeta dentro de sí misma"}, status=400)
        except e.Unauthorized:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        except e.UnauthorizedIncorrectPassword:
            return JsonResponse({"error": "Contraseña incorrecta"}, status=401)
        except e.Forbidden:
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        except e.ForbiddenAlreadyAnswered:
            return JsonResponse({"error": "Ya has respondido a este formulario", "suggested_action": "go_back"}, status=403)
        except e.ForbiddenAssignmentSubmit:
            return JsonResponse({"error": "La tarea ya está entregada o la fecha de entrega se ha pasado"}, status=403)
        except e.ForbiddenEditHasAnswers:
            return JsonResponse({"error": "Este formulario no se puede editar. Ya contiene respuestas", "suggested_action": "close_window"}, status=403)
        except e.ForbiddenExceededLoginAttempts:
            return JsonResponse({"error": "La cuenta está bloqueada debido a actividad sospechosa"}, status=403)
        except e.ForbiddenQuestionnaireAssignmentIsDue:
            return JsonResponse({"error": "No puedes responder a este formulario. El plazo de entrega ya ha pasado", "suggested_action": "go_back"}, status=403)
        except e.ForbiddenQuestionnaireAssignmentIsNotDue:
            return JsonResponse({"error": "¡Lo sentimos! No puedes ver tus respuestas porque el plazo de entrega de la tarea aún no ha pasado"}, status=403)
        except e.NotFound:
            return JsonResponse({"error": "¡Lo que buscas no está por aquí!"}, status=404)
        except e.Unsupported:
            return JsonResponse({"error": "Método HTTP no soportado"}, status=405)
        except e.ConflictUserAlreadyExists:
            return JsonResponse({"error": "Ese usuario ya está registrado"}, status=409)
        except e.ConflictGroupAlreadyExists:
            return JsonResponse({"error": "Ese grupo ya está registrado"}, status=409)
        except e.ConflictUnitAlreadyExists:
            return JsonResponse({"error": "Ya existe un tema con ese nombre"}, status=409)
        except e.ConflictFolderAlreadyExists:
            return JsonResponse({"error": "Ya existe una carpeta con ese nombre en esa ubicación"}, status=409)
        except e.ConflictQuotaExceeded:
            return JsonResponse({"error": "Has excedido tu cuota"}, status=409)
        except e.InternalError:
            return JsonResponse({"error": "Error interno del servidor. Por favor, contacta con un administrador"}, status=500)
    return wrapped

def require_role(roles_list, request):
    if request.session is None:
        raise e.Unauthorized
    if request.session.user.role not in roles_list:
        raise e.Forbidden

def require_valid_session(request):
    require_role([User.UserRole.STUDENT, User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER], request=request)

def expect_body_with(*args, **kwargs):
    request = kwargs.get('request')
    if request is None:
        raise e.InternalError
    if len(request.body) == 0:
        raise e.BadRequest
    try:
        json_body = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise e.BadRequest
    result = ()
    for arg in args:
        try:
            result += json_body[arg],
        except ValueError:
            raise e.BadRequest
    optional = kwargs.get('optional')
    if optional is not None:
        for opt_arg in optional:
            result += json_body.get(opt_arg),
    if len(result) == 1:
        return result[0]
    return result

def validate_password(password):
    if len(password) < 8:
        raise e.BadRequestInvalidPassword

def validate_username(username):
    if not(re.match("^[a-z0-9.]+$", username)) or len(username) < 1:
        raise e.BadRequestInvalidUsername

def validate_tag(tag):
    if not(re.match("^[A-Za-z0-9]+$", tag)) or len(tag) < 1:
        raise e.BadRequestInvalidTag

def validate_year(year):
    if not(re.match("^[0-9-]+$", year)) or len(year) < 1:
        raise e.BadRequestInvalidYear

def parse_usernames_list(usernames):
    non_trimmed_usernames = usernames.split(",")
    trimmed_usernames = list(map(lambda x: x.strip(), non_trimmed_usernames))
    result = []
    for u in trimmed_usernames:
        if len(u) > 0:
            result.append(u)
    return result

def can_see_class(user, classroom):
    return user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER] \
            or (user.role in [User.UserRole.STUDENT, User.UserRole.TEACHER] \
                and UserClass.objects.filter(user=user, classroom=classroom).exists())

def can_edit_class(user, classroom):
    return user.role in [User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_LEADER] \
            or (user.role == User.UserRole.TEACHER and UserClass.objects.filter(user=user, classroom=classroom).exists())

def can_see_questionnaire(user, questionnaire):
    if user.role in [User.UserRole.TEACHER_LEADER, User.UserRole.TEACHER_SYSADMIN]:
        return True
    elif user.role in [User.UserRole.TEACHER, User.UserRole.STUDENT]:
        if UserQuestionnairePermission.objects.filter(user=user, questionnaire=questionnaire).exists():
            return True
        user_classes = UserClass.objects.filter(user=user).values_list('classroom_id', flat=True)
        if PostQuestionnaire.objects.filter(post__classroom__in=user_classes, questionnaire=questionnaire).exists():
            return True
        if user.role == User.UserRole.STUDENT and AnnouncementQuestionnaire.objects.filter(announcement__group=user.student_group, questionnaire=questionnaire).exists():
            return True
        if user.role == User.UserRole.TEACHER:
            for classroom_id in user_classes:
                classroom_group = Class.objects.get(id=classroom_id).group
                if AnnouncementQuestionnaire.objects.filter(questionnaire=questionnaire, announcement__group=classroom_group).exists():
                    return True
    return False

def questionnaire_oldest_assignment_due_date(questionnaire, user):
    user_classes = UserClass.objects.filter(user=user).values_list('classroom_id', flat=True)
    oldest_due_assignment_post_questionnaire_for_user = PostQuestionnaire.objects.filter(questionnaire=questionnaire,
                                                            post__classroom__in=user_classes,
                                                            post__assignment_due_date__isnull=False).order_by('post__assignment_due_date').first()
    if oldest_due_assignment_post_questionnaire_for_user:
        return oldest_due_assignment_post_questionnaire_for_user.post.assignment_due_date
    return None

def questionnaire_assignments(questionnaire, user):
    user_classes = UserClass.objects.filter(user=user).values_list('classroom_id', flat=True)
    unedited_assignments_pq_with_questionnaire = PostQuestionnaire.objects.filter(questionnaire=questionnaire,
                                                      post__classroom__in=user_classes,
                                                      post__kind=Post.PostKind.ASSIGNMENT)
    edited_assignments_pq_with_questionnaire = PostQuestionnaire.objects.filter(questionnaire=questionnaire,
                                                      post__classroom__in=user_classes,
                                                      post__kind=Post.PostKind.AMENDMENT_EDIT,
                                                      post__amendment_original_post__kind=Post.PostKind.ASSIGNMENT)
    unedited_assignments = list(map(lambda pq: pq.post, unedited_assignments_pq_with_questionnaire)) 
    edited_assignments = list(map(lambda pq: pq.post.amendment_original_post, edited_assignments_pq_with_questionnaire))
    return unedited_assignments + edited_assignments

def calculate_score(questionnaire_submit):
    score = None
    choices_questions = ChoicesQuestion.objects.filter(questionnaire=questionnaire_submit.questionnaire)
    for q in choices_questions:
        if not ChoicesQuestionChoice.objects.filter(question=q, is_correct=True).exists():
            pass
        if q.correct_answer_score is not None:
            if ChoicesQuestionAnswer.objects.filter(submit=questionnaire_submit,
                                                    answer__question=q,
                                                    answer__is_correct=True).exists():
                score = (score or 0) + q.correct_answer_score
        if q.incorrect_answer_score is not None:
            if ChoicesQuestionAnswer.objects.filter(submit=questionnaire_submit,
                                                    answer__question=q,
                                                    answer__is_correct=False).exists():
                score = (score or 0) - q.incorrect_answer_score
    return score

def get_from_db(model, *args, **kwargs): # Quite the same as get_object_or_404
    try:
        return model.objects.get(*args, **kwargs)
    except model.DoesNotExist:
        raise e.NotFound

def get_or_create_folder(name, author, parent_folder=None):
    try:
        folder = Folder.objects.get(name=name, author=author, parent_folder=parent_folder)
    except Folder.DoesNotExist:
        folder = Folder()
        folder.name = name
        folder.author = author
        folder.parent_folder = parent_folder
        folder.save()
    return folder
