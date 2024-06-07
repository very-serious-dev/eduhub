from django.db import models

# EP stands for EduPlatform
class EPUser(models.Model):
    username = models.CharField(unique=True, max_length=100)
    name = models.CharField(max_length=120)
    surname = models.CharField(max_length=120)
    encrypted_password = models.CharField(max_length=120)

class EPUserSession(models.Model):
    user = models.ForeignKey(EPUser, on_delete=models.CASCADE)
    token = models.CharField(unique=True, max_length=50)

class EPClass(models.Model):
    name = models.CharField(max_length=100)
    author = models.ForeignKey(EPUser, on_delete=models.CASCADE)
    
    def to_json_obj(self):
        return {
            "name": self.name
        }
