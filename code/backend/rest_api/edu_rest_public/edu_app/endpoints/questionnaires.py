from django.http import JsonResponse
from ..models import Questionnaire, TextQuestion, ChoicesQuestion, ChoicesQuestionChoice
#from ..util.exceptions import Forbidden, ForbiddenAssignmentSubmit, NotFound
#from ..util.helpers import get_from_db, get_or_create_folder, can_edit_class, can_see_class, is_document_used_in_post_or_announcement
from ..util.serializers import questionnaire_to_json

def create_questionnaire(request, title, questions):
    new_questionnaire = Questionnaire()
    new_questionnaire.title = title
    new_questionnaire.author = request.session.user
    new_questionnaire.folder = None
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
