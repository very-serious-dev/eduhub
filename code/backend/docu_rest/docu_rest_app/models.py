from django.db import models

class UserSession(models.Model):
    user_id = models.IntegerField()

    # Sent to client after successful login via HttpOnly Set-Cookie
    token = models.CharField(unique=True, max_length=50)
