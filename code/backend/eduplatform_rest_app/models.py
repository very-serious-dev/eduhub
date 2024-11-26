from django.db import models

EPUSER_STUDENT = 0
EPUSER_TEACHER = 1
EPUSER_TEACHER_SYSADMIN = 2
EPUSER_TEACHER_LEADER = 3

##
# USERS
#

class EPUser(models.Model):
    username = models.CharField(unique=True, max_length=100)
    name = models.CharField(max_length=120)
    surname = models.CharField(max_length=120)
    encrypted_password = models.CharField(max_length=120)
    role = models.IntegerField() # Must be EPUSER_STUDENT, EPUSER_TEACHER,...
    student_group = models.ForeignKey("EPGroup", on_delete=models.SET_NULL, null=True, default=None)

class EPUserSession(models.Model):
    user = models.ForeignKey(EPUser, on_delete=models.CASCADE)
    token = models.CharField(unique=True, max_length=50)

##
# GROUPS AND CLASSES
#

class EPGroup(models.Model):
    tag = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100)
    tutor = models.ForeignKey(EPUser, on_delete=models.SET_NULL, null=True)
    year = models.CharField(max_length=10)

class EPClass(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7)
    group = models.ForeignKey(EPGroup, on_delete=models.CASCADE)
    archived = models.BooleanField(default=False)

class EPUserClass(models.Model):
    user = models.ForeignKey(EPUser, on_delete=models.CASCADE)
    classroom = models.ForeignKey(EPClass, on_delete=models.CASCADE)

##
# CLASS POSTS, TASKS
#

class EPUnit(models.Model):
    name = models.CharField(max_length=100)
    classroom = models.ForeignKey(EPClass, on_delete=models.CASCADE)

class EPPost(models.Model):
    title = models.CharField(max_length=100, null=True)
    content = models.CharField(max_length=2000)
    classroom = models.ForeignKey(EPClass, on_delete=models.CASCADE)
    unit = models.ForeignKey(EPUnit, on_delete=models.CASCADE, null=True)
    publication_date = models.DateTimeField(auto_now=True)
    task_due_date = models.DateTimeField(null=True)

class EPDocument(models.Model):
    url = models.CharField(max_length=200)

class EPPostDocument(models.Model):
    post = models.ForeignKey(EPPost, on_delete=models.CASCADE)
    document = models.ForeignKey(EPDocument, on_delete=models.CASCADE)

class EPTaskSubmit(models.Model):
    author = models.ForeignKey(EPUser, on_delete=models.CASCADE)
    task = models.ForeignKey(EPPost, on_delete=models.CASCADE)
    comment = models.CharField(max_length=1000)
    submit_date = models.DateTimeField(auto_now=True)

class EPTaskSubmitDocument(models.Model):
    task_submit = models.ForeignKey(EPPost, on_delete=models.CASCADE)
    document = models.ForeignKey(EPDocument, on_delete=models.CASCADE)
    
