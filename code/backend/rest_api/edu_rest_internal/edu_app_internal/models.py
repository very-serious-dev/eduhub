###########################
# DO NOT MODIFY THIS FILE #
###########################

##
# * Both edu_rest_public and edu_rest_internal share the same database
#
# * It is managed from edu_rest_public > models.py (not from here!)
#
# * If you need the following models to evolve according to any changes
#   in edu_rest_public > models.py, you need to use:
#
#     python manage.py inspectdb
#
# Thanks!
##

from django.db import models


class EduAppAnnouncement(models.Model):
    title = models.CharField(max_length=100)
    content = models.CharField(max_length=3000)
    modification_date = models.DateTimeField(blank=True, null=True)
    author = models.ForeignKey('EduAppUser', models.DO_NOTHING)
    group = models.ForeignKey('EduAppGroup', models.DO_NOTHING)
    publication_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'edu_app_announcement'


class EduAppAnnouncementdocument(models.Model):
    announcement = models.ForeignKey(EduAppAnnouncement, models.DO_NOTHING)
    document = models.ForeignKey('EduAppDocument', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_announcementdocument'


class EduAppAnnouncementquestionnaire(models.Model):
    announcement = models.ForeignKey(EduAppAnnouncement, models.DO_NOTHING)
    questionnaire = models.ForeignKey('EduAppQuestionnaire', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_announcementquestionnaire'


class EduAppAssignmentsubmit(models.Model):
    comment = models.CharField(max_length=1000, blank=True, null=True)
    assignment = models.ForeignKey('EduAppPost', models.DO_NOTHING)
    author = models.ForeignKey('EduAppUser', models.DO_NOTHING)
    is_score_published = models.BooleanField()
    score = models.FloatField(blank=True, null=True)
    submit_date = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'edu_app_assignmentsubmit'


class EduAppAssignmentsubmitdocument(models.Model):
    submit = models.ForeignKey(EduAppAssignmentsubmit, models.DO_NOTHING)
    document = models.ForeignKey('EduAppDocument', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_assignmentsubmitdocument'


class EduAppChoicesquestion(models.Model):
    title = models.CharField(max_length=500)
    number = models.IntegerField()
    correct_answer_score = models.FloatField(blank=True, null=True)
    incorrect_answer_score = models.FloatField(blank=True, null=True)
    questionnaire = models.ForeignKey('EduAppQuestionnaire', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_choicesquestion'


class EduAppChoicesquestionanswer(models.Model):
    answer = models.ForeignKey('EduAppChoicesquestionchoice', models.DO_NOTHING)
    submit = models.ForeignKey('EduAppQuestionnairesubmit', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_choicesquestionanswer'


class EduAppChoicesquestionchoice(models.Model):
    content = models.CharField(max_length=500)
    is_correct = models.BooleanField()
    question = models.ForeignKey(EduAppChoicesquestion, models.DO_NOTHING)
    number = models.IntegerField()

    class Meta:
        managed = False
        db_table = 'edu_app_choicesquestionchoice'


class EduAppClass(models.Model):
    name = models.CharField(max_length=50)
    theme = models.IntegerField()
    archived = models.BooleanField()
    group = models.ForeignKey('EduAppGroup', models.DO_NOTHING)
    evaluation_criteria = models.CharField(max_length=3000, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'edu_app_class'


class EduAppDocument(models.Model):
    identifier = models.CharField(unique=True, max_length=20)
    name = models.CharField(max_length=150)
    size = models.IntegerField()
    mime_type = models.CharField(max_length=50)
    is_protected = models.BooleanField()
    folder = models.ForeignKey('EduAppFolder', models.DO_NOTHING, blank=True, null=True)
    author = models.ForeignKey('EduAppUser', models.DO_NOTHING)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'edu_app_document'


class EduAppFailedloginattempt(models.Model):
    username = models.CharField(max_length=50)
    datetime = models.DateTimeField()
    client_ip = models.CharField(max_length=128, blank=True, null=True)
    client_user_agent = models.CharField(max_length=200, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'edu_app_failedloginattempt'


class EduAppFolder(models.Model):
    name = models.CharField(max_length=50)
    author = models.ForeignKey('EduAppUser', models.DO_NOTHING)
    created_at = models.DateTimeField()
    parent_folder = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'edu_app_folder'


class EduAppGroup(models.Model):
    tag = models.CharField(primary_key=True, max_length=10)
    name = models.CharField(max_length=50)
    year = models.CharField(max_length=10)
    tutor = models.ForeignKey('EduAppUser', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'edu_app_group'


class EduAppPost(models.Model):
    title = models.CharField(max_length=100)
    content = models.CharField(max_length=3000)
    kind = models.IntegerField()
    publication_date = models.DateTimeField()
    classroom = models.ForeignKey(EduAppClass, models.DO_NOTHING)
    unit = models.ForeignKey('EduAppUnit', models.DO_NOTHING, blank=True, null=True)
    author = models.ForeignKey('EduAppUser', models.DO_NOTHING)
    assignment_due_date = models.DateTimeField(blank=True, null=True)
    amendment_original_post = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'edu_app_post'


class EduAppPostdocument(models.Model):
    document = models.ForeignKey(EduAppDocument, models.DO_NOTHING)
    post = models.ForeignKey(EduAppPost, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_postdocument'


class EduAppPostquestionnaire(models.Model):
    post = models.ForeignKey(EduAppPost, models.DO_NOTHING)
    questionnaire = models.ForeignKey('EduAppQuestionnaire', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_postquestionnaire'


class EduAppQuestionnaire(models.Model):
    title = models.CharField(max_length=100)
    archived = models.BooleanField()
    is_protected = models.BooleanField()
    created_at = models.DateTimeField()
    author = models.ForeignKey('EduAppUser', models.DO_NOTHING)
    folder = models.ForeignKey(EduAppFolder, models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'edu_app_questionnaire'


class EduAppQuestionnairesubmit(models.Model):
    created_at = models.DateTimeField()
    questionnaire = models.ForeignKey(EduAppQuestionnaire, models.DO_NOTHING)
    user = models.ForeignKey('EduAppUser', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_questionnairesubmit'


class EduAppTextquestion(models.Model):
    title = models.CharField(max_length=500)
    number = models.IntegerField()
    questionnaire = models.ForeignKey(EduAppQuestionnaire, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_textquestion'


class EduAppTextquestionanswer(models.Model):
    answer = models.CharField(max_length=500)
    question = models.ForeignKey(EduAppTextquestion, models.DO_NOTHING)
    submit = models.ForeignKey(EduAppQuestionnairesubmit, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_textquestionanswer'


class EduAppUnit(models.Model):
    name = models.CharField(max_length=50)
    classroom = models.ForeignKey(EduAppClass, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_unit'


class EduAppUser(models.Model):
    username = models.CharField(unique=True, max_length=50)
    name = models.CharField(max_length=50)
    surname = models.CharField(max_length=50)
    encrypted_password = models.CharField(max_length=120)
    role = models.IntegerField()
    max_folders = models.IntegerField()
    max_documents = models.IntegerField()
    max_documents_size = models.IntegerField()
    student_group = models.ForeignKey(EduAppGroup, models.DO_NOTHING, blank=True, null=True)
    archived = models.BooleanField()
    password_reset_token = models.CharField(unique=True, max_length=30, blank=True, null=True)
    last_password_change = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'edu_app_user'


class EduAppUserclass(models.Model):
    classroom = models.ForeignKey(EduAppClass, models.DO_NOTHING)
    user = models.ForeignKey(EduAppUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_userclass'


class EduAppUserdocumentpermission(models.Model):
    document = models.ForeignKey(EduAppDocument, models.DO_NOTHING)
    user = models.ForeignKey(EduAppUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_userdocumentpermission'


class EduAppUserfolderpermission(models.Model):
    folder = models.ForeignKey(EduAppFolder, models.DO_NOTHING)
    user = models.ForeignKey(EduAppUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_userfolderpermission'


class EduAppUserquestionnairepermission(models.Model):
    questionnaire = models.ForeignKey(EduAppQuestionnaire, models.DO_NOTHING)
    user = models.ForeignKey(EduAppUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_userquestionnairepermission'


class EduAppUsersession(models.Model):
    token = models.CharField(unique=True, max_length=30)
    one_time_token = models.CharField(unique=True, max_length=30)
    one_time_token_already_used = models.BooleanField()
    user = models.ForeignKey(EduAppUser, models.DO_NOTHING)
    created_at = models.DateTimeField()

    class Meta:
        managed = False
        db_table = 'edu_app_usersession'
