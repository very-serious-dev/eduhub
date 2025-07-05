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
    publication_date = models.DateTimeField()
    modification_date = models.DateTimeField(blank=True, null=True)
    author = models.ForeignKey('EduAppUser', models.DO_NOTHING)
    group = models.ForeignKey('EduAppGroup', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_announcement'


class EduAppAnnouncementdocument(models.Model):
    announcement = models.ForeignKey(EduAppAnnouncement, models.CASCADE)
    document = models.ForeignKey('EduAppDocument', models.CASCADE)

    class Meta:
        managed = False
        db_table = 'edu_app_announcementdocument'


class EduAppAssignmentsubmit(models.Model):
    comment = models.CharField(max_length=1000, blank=True, null=True)
    submit_date = models.DateTimeField()
    assignment = models.ForeignKey('EduAppPost', models.DO_NOTHING)
    author = models.ForeignKey('EduAppUser', models.DO_NOTHING)
    is_score_published = models.BooleanField()
    score = models.FloatField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'edu_app_assignmentsubmit'


class EduAppAssignmentsubmitdocument(models.Model):
    submit = models.ForeignKey(EduAppAssignmentsubmit, models.DO_NOTHING)
    document = models.ForeignKey('EduAppDocument', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_assignmentsubmitdocument'


class EduAppClass(models.Model):
    name = models.CharField(max_length=50)
    theme = models.IntegerField()
    archived = models.BooleanField()
    group = models.ForeignKey('EduAppGroup', models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_class'


class EduAppDocument(models.Model):
    identifier = models.CharField(unique=True, max_length=20)
    name = models.CharField(max_length=150)
    size = models.IntegerField()
    mime_type = models.CharField(max_length=50)
    is_protected = models.BooleanField()
    created_at = models.DateTimeField()
    author = models.ForeignKey('EduAppUser', models.DO_NOTHING)
    folder = models.ForeignKey('EduAppFolder', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'edu_app_document'


class EduAppFolder(models.Model):
    name = models.CharField(max_length=50)
    created_at = models.DateTimeField()
    author = models.ForeignKey('EduAppUser', models.DO_NOTHING)
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
    assignment_due_date = models.DateField(blank=True, null=True)
    classroom = models.ForeignKey(EduAppClass, models.DO_NOTHING)
    unit = models.ForeignKey('EduAppUnit', models.DO_NOTHING, blank=True, null=True)
    author = models.ForeignKey('EduAppUser', models.DO_NOTHING)
    amendment_original_post = models.ForeignKey('self', models.DO_NOTHING, blank=True, null=True)

    class Meta:
        managed = False
        db_table = 'edu_app_post'


class EduAppPostdocument(models.Model):
    document = models.ForeignKey(EduAppDocument, models.CASCADE)
    post = models.ForeignKey(EduAppPost, models.CASCADE)

    class Meta:
        managed = False
        db_table = 'edu_app_postdocument'


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
    document = models.ForeignKey(EduAppDocument, models.CASCADE)
    user = models.ForeignKey(EduAppUser, models.CASCADE)

    class Meta:
        managed = False
        db_table = 'edu_app_userdocumentpermission'


class EduAppUserfolderpermission(models.Model):
    folder = models.ForeignKey(EduAppFolder, models.CASCADE)
    user = models.ForeignKey(EduAppUser, models.CASCADE)

    class Meta:
        managed = False
        db_table = 'edu_app_userfolderpermission'


class EduAppUsersession(models.Model):
    token = models.CharField(unique=True, max_length=30)
    one_time_token = models.CharField(unique=True, max_length=30)
    one_time_token_already_used = models.BooleanField()
    user = models.ForeignKey(EduAppUser, models.DO_NOTHING)

    class Meta:
        managed = False
        db_table = 'edu_app_usersession'
