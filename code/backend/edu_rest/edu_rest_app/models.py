from django.db import models

USER_STUDENT = 0
USER_TEACHER = 1
USER_TEACHER_SYSADMIN = 2
USER_TEACHER_LEADER = 3

POST_PUBLICATION = 0
POST_TASK = 1

##
# USERS
#

class User(models.Model):
    username = models.CharField(unique=True, max_length=100)
    name = models.CharField(max_length=120)
    surname = models.CharField(max_length=120)
    encrypted_password = models.CharField(max_length=120)
    role = models.IntegerField() # Must be USER_STUDENT, USER_TEACHER,...
    student_group = models.ForeignKey("Group", on_delete=models.SET_NULL, null=True, default=None)

class UserSession(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)

    # Sent to client after successful login via HttpOnly Set-Cookie
    token = models.CharField(unique=True, max_length=50)

    # Sent to client after successful login via response body (JSON)
    # See docs/auth_flow.txt for further information
    one_time_token = models.CharField(unique=True, max_length=50)
    one_time_token_already_used = models.BooleanField(default=False)

##
# GROUPS AND CLASSES
#

class Group(models.Model):
    tag = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100)
    tutor = models.ForeignKey(User, on_delete=models.SET_NULL, null=True)
    year = models.CharField(max_length=10)

class Class(models.Model):
    name = models.CharField(max_length=100)
    color = models.CharField(max_length=7)
    group = models.ForeignKey(Group, on_delete=models.CASCADE)
    archived = models.BooleanField(default=False)

class UserClass(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    classroom = models.ForeignKey(Class, on_delete=models.CASCADE)

##
# CLASS POSTS, TASKS
#

class Unit(models.Model):
    name = models.CharField(max_length=100)
    classroom = models.ForeignKey(Class, on_delete=models.CASCADE)

class Post(models.Model):
    title = models.CharField(max_length=100, null=True)
    content = models.CharField(max_length=2000)
    kind = models.IntegerField() # Must be POST_PUBLICATION, POST_TASK
    classroom = models.ForeignKey(Class, on_delete=models.CASCADE)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, null=True)
    publication_date = models.DateTimeField(auto_now=True)
    task_due_date = models.DateField(null=True)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

class Document(models.Model):
    identifier = models.CharField(max_length=20, unique=True)
    name = models.CharField(max_length=300)
    size = models.IntegerField() # TO-DO: Check if with 30 MB max file size this is enough
    mime_type = models.CharField(max_length=50)
    author = models.ForeignKey(User, on_delete=models.CASCADE)

class PostDocument(models.Model):
    post = models.ForeignKey(Post, on_delete=models.CASCADE)
    document = models.ForeignKey(Document, on_delete=models.CASCADE)

class TaskSubmit(models.Model):
    author = models.ForeignKey(User, on_delete=models.CASCADE)
    task = models.ForeignKey(Post, on_delete=models.CASCADE)
    comment = models.CharField(max_length=1000)
    submit_date = models.DateTimeField(auto_now=True)

class TaskSubmitDocument(models.Model):
    task_submit = models.ForeignKey(Post, on_delete=models.CASCADE)
    document = models.ForeignKey(Document, on_delete=models.CASCADE)
    
