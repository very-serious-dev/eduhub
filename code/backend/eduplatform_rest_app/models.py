from django.db import models

STUDENT = "student"
TEACHER = "teacher"
SCHOOL_LEADER = "school_leader"
SYSADMIN = "sysadmin"

##
# USERS
#

# Base user class - only created together with a EPStudent or EPTeacher
class EPUser(models.Model):
    username = models.CharField(unique=True, max_length=100)
    name = models.CharField(max_length=120)
    surname = models.CharField(max_length=120)
    encrypted_password = models.CharField(max_length=120)
        
class EPStudent(models.Model):
    user = models.ForeignKey(EPUser, on_delete=models.CASCADE, unique=True)
    group = models.ForeignKey("EPGroup", on_delete=models.SET_NULL, null=True) # TO-DO: Check if can be converted to null after group deletion; (maybe blank=True is needed too?)
        
    def to_json_obj(self):
        return {
            "username": self.user.username,
            "name": self.user.name,
            "surname": self.user.surname,
            "roles": [STUDENT],
            "student_group": self.group_id
        }

class EPTeacher(models.Model):
    user = models.ForeignKey(EPUser, on_delete=models.CASCADE, unique=True)
    is_school_leader = models.BooleanField(default=False)
    is_sysadmin = models.BooleanField(default=False)
    
    def roles_array(self):
        roles = [TEACHER]
        if self.is_school_leader:
            roles.append(SCHOOL_LEADER)
        if self.is_sysadmin:
            roles.append(SYSADMIN)
        return roles

    def to_json_obj(self):
        return {
            "username": self.user.username,
            "name": self.user.name,
            "surname": self.user.surname,
            "roles": self.user.roles_array()
        }

class EPUserSession(models.Model):
    user = models.ForeignKey(EPUser, on_delete=models.CASCADE)
    token = models.CharField(unique=True, max_length=50)

##
# GROUPS AND CLASSES
#

class EPGroup(models.Model):
    tag = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100)
    tutor = models.ForeignKey(EPTeacher, on_delete=models.SET_NULL, null=True)
    year = models.CharField(max_length=10)
    
    def to_json_obj(self):
        return {
            "tag": self.tag,
            "name": self.name,
            "tutor": {
                "username": self.tutor.username,
                "name": self.tutor.name,
                "surname": self.tutor.surname
            }
        }

class EPClass(models.Model):
    name = models.CharField(max_length=100)
    group = models.ForeignKey(EPGroup, on_delete=models.CASCADE)
    
    def to_json_obj(self):
        return {
            "id": self.id,
            "name": self.name,
            "group": self.group_id
        }

class EPTeacherClass(models.Model):
    teacher = models.ForeignKey(EPTeacher, on_delete=models.CASCADE)
    classroom = models.ForeignKey(EPClass, on_delete=models.CASCADE)

class EPStudentClass(models.Model):
    student = models.ForeignKey(EPStudent, on_delete=models.CASCADE)
    classroom = models.ForeignKey(EPClass, on_delete=models.CASCADE)

##
# CLASS POSTS, TASKS
#

class EPTask(models.Model):
    title = models.CharField(max_length=100)
    instructions = models.CharField(max_length=2000)
    due_date = models.DateTimeField(null=True)

class EPUnit(models.Model):
    name = models.CharField(max_length=100)

class EPPost(models.Model):
    content = models.CharField(max_length=2000)
    classroom = models.ForeignKey(EPClass, on_delete=models.CASCADE)
    task = models.ForeignKey(EPTask, on_delete=models.CASCADE, null=True)
    unit = models.ForeignKey(EPUnit, on_delete=models.CASCADE, null=True)
    publication_date = models.DateTimeField(auto_now=True)

class EPDocument(models.Model):
    url = models.CharField(max_length=200)

class EPPostDocument(models.Model):
    post = models.ForeignKey(EPPost, on_delete=models.CASCADE)
    document = models.ForeignKey(EPDocument, on_delete=models.CASCADE)

class EPTaskSubmit(models.Model):
    author = models.ForeignKey(EPStudent, on_delete=models.CASCADE)
    task = models.ForeignKey(EPTask, on_delete=models.CASCADE)
    comment = models.CharField(max_length=1000)
    submit_date = models.DateTimeField(auto_now=True)

class EPTaskSubmitDocument(models.Model):
    task_submit = models.ForeignKey(EPPost, on_delete=models.CASCADE)
    document = models.ForeignKey(EPDocument, on_delete=models.CASCADE)
    
