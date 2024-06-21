from django.db import models

# EP stands for EduPlatform
class EPUser(models.Model):
    username = models.CharField(unique=True, max_length=100)
    name = models.CharField(max_length=120)
    surname = models.CharField(max_length=120)
    encrypted_password = models.CharField(max_length=120)
    student_registered_group = models.ForeignKey("EPGroup", on_delete=models.SET_NULL, null=True, blank=True, default=None)
    is_teacher = models.BooleanField(default=False)
    is_school_leader = models.BooleanField(default=False)
    is_sysadmin = models.BooleanField(default=False)
    
    def roles_array(self):
        roles = []
        if self.student_registered_group is not None:
            roles.append("student")
        if self.is_teacher:
            roles.append("teacher")
        if self.is_school_leader:
            roles.append("school_leader")
        if self.is_sysadmin:
            roles.append("sysadmin")
        return roles
                
    def to_json_obj(self):
        json_obj = {
            "username": self.username,
            "name": self.name,
            "surname": self.surname,
            "roles": self.roles_array()
        }
        if self.student_registered_group is not None:
            json_obj["student_group"] = self.student_registered_group_id
        return json_obj

class EPUserSession(models.Model):
    user = models.ForeignKey(EPUser, on_delete=models.CASCADE)
    token = models.CharField(unique=True, max_length=50)

class EPGroup(models.Model):
    tag = models.CharField(max_length=10, primary_key=True)
    name = models.CharField(max_length=100)
    tutor = models.ForeignKey(EPUser, on_delete=models.CASCADE)
    
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

class EPUserClass(models.Model):
    user = models.ForeignKey(EPUser, on_delete=models.CASCADE)
    classroom = models.ForeignKey(EPClass, on_delete=models.CASCADE)
