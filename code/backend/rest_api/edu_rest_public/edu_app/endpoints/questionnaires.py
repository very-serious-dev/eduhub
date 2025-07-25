from django.http import JsonResponse
from django.utils import timezone
from .posts import folder_name_for_classroom, POSTS_DOCUMENTS_ROOT_FOLDER_NAME
from ..models import Class, Folder, Questionnaire, TextQuestion, ChoicesQuestion, ChoicesQuestionChoice, PostQuestionnaire, AnnouncementQuestionnaire, QuestionnaireSubmit, TextQuestionAnswer, ChoicesQuestionAnswer, UserClass, AssignmentSubmit, User, UserFolderPermission, UserQuestionnairePermission
from ..util.helpers import get_from_db, can_see_questionnaire, get_or_create_folder, can_see_class, questionnaire_oldest_assignment_due_date, questionnaire_assignments, calculate_score
from ..util.exceptions import Forbidden, ForbiddenAlreadyAnswered, ForbiddenQuestionnaireAssignmentIsDue, ForbiddenQuestionnaireAssignmentIsNotDue, ForbiddenEditHasAnswers
from ..util.serializers import questionnaire_to_json, text_question_to_json, choices_question_to_json, questionnaire_detail_to_json, class_theme, user_to_json

def create_questionnaire(request, title, questions, classroom_id, folder_id):
    if classroom_id:
        classroom = get_from_db(Class, id=classroom_id, archived=False)
        if not can_see_class(request.session.user, classroom):
            raise Forbidden
        root_folder = get_or_create_folder(POSTS_DOCUMENTS_ROOT_FOLDER_NAME, request.session.user)
        folder = get_or_create_folder(folder_name_for_classroom(classroom), request.session.user, root_folder)
    elif folder_id:
        folder = get_from_db(Folder, id=folder_id, author=request.session.user)
    else:
        folder = None
    new_questionnaire = Questionnaire()
    new_questionnaire.title = title
    new_questionnaire.author = request.session.user
    new_questionnaire.folder = folder
    new_questionnaire.save()
    __save_questions_in_db(questions, new_questionnaire)
    if folder:
        # Also grant access to users who were allowed in the folder
        folder_granted_users = list(map(lambda ufp: ufp.user, UserFolderPermission.objects.filter(folder=folder, user__archived=False)))
        for u in folder_granted_users:
            uqp = UserQuestionnairePermission()
            uqp.user = u
            uqp.questionnaire = new_questionnaire
            uqp.save()
    return JsonResponse({"success": True,
                         "result": {
                            "operation": "questionnaire_added",
                            "questionnaire": questionnaire_to_json(new_questionnaire)
                        }}, status=201)

def delete_questionnaire(request, q_id):
    questionnaire = get_from_db(Questionnaire, id=q_id, author=request.session.user)
    questionnaire.archived = True
    questionnaire.save()
    return JsonResponse({"success": True,
                         "result": {
                             "operation": "questionnaire_deleted",
                             "removed_questionnaire_id": questionnaire.id
                         }}, status=200)

def edit_questions(request, q_id, title, questions):
    questionnaire = get_from_db(Questionnaire, id=q_id, author=request.session.user)
    if QuestionnaireSubmit.objects.filter(questionnaire=questionnaire).exists():
        raise ForbiddenEditHasAnswers
    questionnaire.title = title
    questionnaire.save()
    TextQuestion.objects.filter(questionnaire=questionnaire).delete()
    ChoicesQuestion.objects.filter(questionnaire=questionnaire).delete()
    __save_questions_in_db(questions, questionnaire)
    return JsonResponse({"success": True,
                         "result": {
                            "operation": "questionnaire_edited",
                            "questionnaire": questionnaire_to_json(questionnaire)
                        }}, status=201)

def get_questions(request, q_id):
    questionnaire = get_from_db(Questionnaire, id=q_id, archived=False)
    if not can_see_questionnaire(request.session.user, questionnaire):
        raise Forbidden
    if request.session.user.role == User.UserRole.STUDENT:
        is_teacher = False
        # Student wants to answer questionnaire
        if QuestionnaireSubmit.objects.filter(author=request.session.user, questionnaire=questionnaire).exists():
            raise ForbiddenAlreadyAnswered
        questionnaire_due_date = questionnaire_oldest_assignment_due_date(questionnaire, request.session.user)
        if questionnaire_due_date and timezone.now() > questionnaire_due_date:
            raise ForbiddenQuestionnaireAssignmentIsDue
    elif request.session.user.role in [User.UserRole.TEACHER, User.UserRole.TEACHER_SYSADMIN, User.UserRole.TEACHER_SYSADMIN]:
        is_teacher = True
        # Teacher wants to edit questionnaire
        if QuestionnaireSubmit.objects.filter(questionnaire=questionnaire).exists():
            raise ForbiddenEditHasAnswers
    text_questions_json, choices_questions_json = __get_questionnaire_questions_json(questionnaire, show_correct_answers=is_teacher)
    questions = text_questions_json + choices_questions_json
    due_date = questionnaire_oldest_assignment_due_date(questionnaire, request.session.user)
    theme = __get_theme_for_questionnaire(questionnaire)
    return JsonResponse(questionnaire_detail_to_json(questionnaire.id, questionnaire.title, questions, due_date, theme), status=200)

def get_submits(request, q_id):
    questionnaire = get_from_db(Questionnaire, id=q_id, archived=False)
    if not can_see_questionnaire(request.session.user, questionnaire):
        raise Forbidden
    text_questions_json, choices_questions_json = __get_questionnaire_questions_json(questionnaire, True)
    submits = []
    for submit in QuestionnaireSubmit.objects.filter(questionnaire=questionnaire, author__archived=False):
        text_answers_json, choices_answers_json = __get_questionnaire_submit_answers_json(submit)
        submits.append({"author": user_to_json(submit.author),
                        "answers": text_answers_json + choices_answers_json})
    return JsonResponse({"submits": submits, "questions": text_questions_json + choices_questions_json, "title": questionnaire.title}, status=200)

def create_submit(request, q_id, answers):
    questionnaire = get_from_db(Questionnaire, id=q_id, archived=False)
    if not can_see_questionnaire(request.session.user, questionnaire):
        raise Forbidden
    if QuestionnaireSubmit.objects.filter(author=request.session.user, questionnaire=questionnaire).exists():
        raise ForbiddenAlreadyAnswered
    questionnaire_due_date = questionnaire_oldest_assignment_due_date(questionnaire, request.session.user)
    if questionnaire_due_date and timezone.now() > questionnaire_due_date:
        raise ForbiddenQuestionnaireAssignmentIsDue
    new_questionnaire_submit = QuestionnaireSubmit()
    new_questionnaire_submit.author = request.session.user
    new_questionnaire_submit.questionnaire = questionnaire
    new_questionnaire_submit.save()
    for answer in answers:
        if answer['type'] == 'text':
            question = get_from_db(TextQuestion, questionnaire=questionnaire, number=answer['number'])
            new_answer = TextQuestionAnswer()
            new_answer.submit = new_questionnaire_submit
            new_answer.question = question
            new_answer.answer = answer['answer']
            new_answer.save()
        elif answer['type'] == 'choices':
            if len(answer['answer']) > 0:
                question = get_from_db(ChoicesQuestion, questionnaire=questionnaire, number=answer['number'])
                choice = get_from_db(ChoicesQuestionChoice, question=question, number=answer['answer'])
                new_answer = ChoicesQuestionAnswer()
                new_answer.submit = new_questionnaire_submit
                new_answer.answer = choice
                new_answer.save()
    related_assignments = questionnaire_assignments(questionnaire, request.session.user)
    for assignment in related_assignments:
        existing_submit = AssignmentSubmit.objects.filter(author=request.session.user, assignment=assignment).first()
        if existing_submit:
            existing_submit.questionnaire_submit = new_questionnaire_submit
            existing_submit.save()
        else:
            new_assignment_submit = AssignmentSubmit()
            new_assignment_submit.author = request.session.user
            new_assignment_submit.assignment = assignment
            new_assignment_submit.comment = None
            new_assignment_submit.questionnaire_submit = new_questionnaire_submit
            new_assignment_submit.score = calculate_score(new_questionnaire_submit)
            new_assignment_submit.save()
    return JsonResponse({"success": True}, status=201)

def get_submit(request, q_id, username):
    questionnaire = get_from_db(Questionnaire, id=q_id, archived=False)
    if not can_see_questionnaire(request.session.user, questionnaire):
        raise Forbidden
    if request.session.user.role == User.UserRole.STUDENT:
        if request.session.user.username != username:
            raise Forbidden
        questionnaire_due_date = questionnaire_oldest_assignment_due_date(questionnaire, request.session.user)
        if questionnaire_due_date and timezone.now() < questionnaire_due_date:
            raise ForbiddenQuestionnaireAssignmentIsNotDue
    submit = get_from_db(QuestionnaireSubmit, questionnaire=questionnaire, author__username=username)

    text_questions_json, choices_questions_json = __get_questionnaire_questions_json(questionnaire, True)
    questions = text_questions_json + choices_questions_json

    text_answers_json, choices_answers_json = __get_questionnaire_submit_answers_json(submit)
    answers = text_answers_json + choices_answers_json
    return JsonResponse({"answers": answers, "questions": questions}, status=200)

def __save_questions_in_db(questions, questionnaire):
    for qIndex, q in enumerate(questions):
        if q["type"] == "text":
            new_text_question = TextQuestion()
            new_text_question.number = qIndex + 1
            new_text_question.title = q["title"]
            new_text_question.questionnaire = questionnaire
            new_text_question.save()
        if q["type"] == "choices":
            new_choices_question = ChoicesQuestion()
            new_choices_question.number = qIndex + 1
            new_choices_question.title = q["title"]
            new_choices_question.correct_answer_score = q.get("correct_answer_score")
            new_choices_question.incorrect_answer_score = q.get("incorrect_answer_score")
            new_choices_question.questionnaire = questionnaire
            new_choices_question.save()
            for cIndex, c in enumerate(q['choices']):
                new_choice = ChoicesQuestionChoice()
                new_choice.content = c["content"]
                new_choice.number = cIndex + 1
                new_choice.is_correct = c["is_correct"]
                new_choice.question = new_choices_question
                new_choice.save()

def __get_questionnaire_questions_json(questionnaire, show_correct_answers):
    text_questions = TextQuestion.objects.filter(questionnaire=questionnaire)
    text_questions_json = list(map(lambda tq: text_question_to_json(tq), text_questions))
    choices_questions = ChoicesQuestion.objects.filter(questionnaire=questionnaire)
    choices_questions_json = []
    for cq in choices_questions:
        choices = ChoicesQuestionChoice.objects.filter(question=cq)
        choices_array = list(map(lambda c: { "id": c.id, "content": c.content, "number": c.number}, choices))
        if show_correct_answers:
            correct_question_choice = choices.filter(is_correct=True).first()
            choices_question_json = choices_question_to_json(cq, choices_array, correct_question_choice)
        else:
            choices_question_json = choices_question_to_json(cq, choices_array, None)
        choices_questions_json.append(choices_question_json)
    return text_questions_json, choices_questions_json

def __get_questionnaire_submit_answers_json(submit):
    text_answers = TextQuestionAnswer.objects.filter(submit=submit)
    text_answers_json = list(map(lambda tqa: {"answer": tqa.answer, "question_id": tqa.question_id, "type": "text"}, text_answers))
    choices_answers = ChoicesQuestionAnswer.objects.filter(submit=submit)
    choices_answers_json = list(map(lambda cqa: {"answer_id": cqa.answer_id, "question_id": cqa.answer.question_id, "type": "choices"}, choices_answers))
    return text_answers_json, choices_answers_json

def __get_theme_for_questionnaire(questionnaire):
    # Theme will be BLUE (default) unless the questionnaire is attached only to one classroom, in such case it inherits its theme
    theme = Class.ClassTheme.BLUE
    if not AnnouncementQuestionnaire.objects.filter(questionnaire=questionnaire).exists():
        distinct_classrooms = set()
        for pq in PostQuestionnaire.objects.filter(questionnaire=questionnaire).select_related("post"):
            distinct_classrooms.add(pq.post.classroom_id)
        if len(distinct_classrooms) == 1:
            theme = class_theme(Class.objects.get(id=list(distinct_classrooms)[0]))
    return theme
