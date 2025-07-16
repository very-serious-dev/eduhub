from django.http import JsonResponse
from ..models import Folder, Questionnaire, TextQuestion, ChoicesQuestion, ChoicesQuestionChoice
from ..util.helpers import get_from_db
from ..util.serializers import questionnaire_to_json

def create_questionnaire(request, title, questions, folder_id):
    folder = get_from_db(Folder, id=folder_id, author=request.session.user) if folder_id else None
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
