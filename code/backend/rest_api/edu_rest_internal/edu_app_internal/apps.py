from django.apps import AppConfig
from django.utils import timezone

def duplicate_questionnaire_as_soft_deleted(sender, instance, **kwargs):
    from . import models

    soft_deleted_questionnaire = models.EduAppQuestionnaire()
    soft_deleted_questionnaire.title = instance.title
    soft_deleted_questionnaire.mode = instance.mode
    soft_deleted_questionnaire.author_id = instance.author_id
    soft_deleted_questionnaire.created_at = instance.created_at
    soft_deleted_questionnaire.folder = None
    soft_deleted_questionnaire.archived = True
    soft_deleted_questionnaire.save()

    models.EduAppChoicesquestion.objects.filter(questionnaire=instance).update(questionnaire=soft_deleted_questionnaire)
    models.EduAppTextquestion.objects.filter(questionnaire=instance).update(questionnaire=soft_deleted_questionnaire)
    models.EduAppQuestionnairesubmit.objects.filter(questionnaire=instance).update(questionnaire=soft_deleted_questionnaire)
    models.EduAppAnnouncementquestionnaire.objects.filter(questionnaire=instance).update(questionnaire=soft_deleted_questionnaire)
    models.EduAppPostquestionnaire.objects.filter(questionnaire=instance).update(questionnaire=soft_deleted_questionnaire)
    # After this, all models instances related to the original EduAppQuestionnaire are no longer tied to it, but to the soft-deleted copy

class EduAppInternalConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'edu_app_internal'
    
    def ready(self):
        from django.db.models.signals import pre_delete
        from . import models
        
        # No problem on avoiding dispatch_uid in here.
        # If safe_delete_questionnaire gets called multiple times for one questionnaire, it's going to be idempotent
        pre_delete.connect(duplicate_questionnaire_as_soft_deleted, sender=models.EduAppQuestionnaire)
