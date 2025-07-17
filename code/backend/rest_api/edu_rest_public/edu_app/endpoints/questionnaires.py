from django.http import JsonResponse
from .posts import folder_name_for_classroom, POSTS_DOCUMENTS_ROOT_FOLDER_NAME
from ..models import Class, Folder, Questionnaire, TextQuestion, ChoicesQuestion, ChoicesQuestionChoice, Class, PostQuestionnaire, AnnouncementQuestionnaire, QuestionnaireSubmit, TextQuestionAnswer, ChoicesQuestionAnswer
from ..util.helpers import get_from_db, can_see_questionnaire, get_or_create_folder, can_see_class
from ..util.exceptions import Forbidden, ForbiddenAlreadyAnswered
from ..util.serializers import questionnaire_to_json, text_question_to_json, choices_question_to_json, questionnaire_detail_to_json, class_theme

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
    for qIndex, q in enumerate(questions):
        if q["type"] == "text":
            new_text_question = TextQuestion()
            new_text_question.number = qIndex + 1
            new_text_question.title = q["title"]
            new_text_question.questionnaire = new_questionnaire
            new_text_question.save()
        if q["type"] == "choices":
            new_choices_question = ChoicesQuestion()
            new_choices_question.number = qIndex + 1
            new_choices_question.title = q["title"]
            new_choices_question.correct_answer_score = q.get("correct_answer_score")
            new_choices_question.incorrect_answer_score = q.get("incorrect_answer_score")
            new_choices_question.questionnaire = new_questionnaire
            new_choices_question.save()
            for cIndex, c in enumerate(q['choices']):
                new_choice = ChoicesQuestionChoice()
                new_choice.content = c["content"]
                new_choice.number = cIndex + 1
                new_choice.is_correct = c["is_correct"]
                new_choice.question = new_choices_question
                new_choice.save()
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

def get_questions(request, q_id):
    questionnaire = get_from_db(Questionnaire, id=q_id, archived=False)
    if not can_see_questionnaire(request.session.user, questionnaire):
        raise Forbidden
    if QuestionnaireSubmit.objects.filter(author=request.session.user, questionnaire=questionnaire).exists():
        raise ForbiddenAlreadyAnswered
    text_questions = TextQuestion.objects.filter(questionnaire=questionnaire)
    text_questions_json = list(map(lambda tq: text_question_to_json(tq.title, tq.number), text_questions))
    choices_questions = ChoicesQuestion.objects.filter(questionnaire=questionnaire)
    choices_questions_json = []
    for cq in choices_questions:
        choices = ChoicesQuestionChoice.objects.filter(question=cq)
        choices_array = list(map(lambda c: { "content": c.content, "number": c.number}, choices))
        choices_questions_json.append(choices_question_to_json(cq.title, choices_array, cq.number))
    # Theme will be BLUE (default) unless the questionnaire is attached only to one classroom, in such case it inherits its theme
    theme = Class.ClassTheme.BLUE
    if not AnnouncementQuestionnaire.objects.filter(questionnaire=questionnaire).exists():
        distinct_classrooms = set()
        for pq in PostQuestionnaire.objects.filter(questionnaire=questionnaire).select_related("post"):
            distinct_classrooms.add(pq.post.classroom_id)
        if len(distinct_classrooms) == 1:
            theme = class_theme(Class.objects.get(id=list(distinct_classrooms)[0]))
    return JsonResponse(questionnaire_detail_to_json(questionnaire.id, questionnaire.title, text_questions_json + choices_questions_json, theme), status=200)

def get_results(request, q_id):
    return JsonResponse({"error": "Unimplemented"}, status=500)

def create_submit(request, q_id, answers):
    questionnaire = get_from_db(Questionnaire, id=q_id, archived=False)
    if not can_see_questionnaire(request.session.user, questionnaire):
        raise Forbidden
    if QuestionnaireSubmit.objects.filter(author=request.session.user, questionnaire=questionnaire).exists():
        raise ForbiddenAlreadyAnswered
    submit = QuestionnaireSubmit()
    submit.author = request.session.user
    submit.questionnaire = questionnaire
    submit.save()
    for answer in answers:
        if answer['type'] == 'text':
            question = get_from_db(TextQuestion, questionnaire=questionnaire, number=answer['number'])
            new_answer = TextQuestionAnswer()
            new_answer.submit = submit
            new_answer.question = question
            new_answer.answer = answer['answer']
            new_answer.save()
        elif answer['type'] == 'choices':
            if len(answer['answer']) > 0:
                question = get_from_db(ChoicesQuestion, questionnaire=questionnaire, number=answer['number'])
                choice = get_from_db(ChoicesQuestionChoice, question=question, number=answer['answer'])
                new_answer = ChoicesQuestionAnswer()
                new_answer.submit = submit
                new_answer.answer = choice
                new_answer.save()
    return JsonResponse({"success": True}, status=201)
