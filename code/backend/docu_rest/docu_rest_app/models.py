from django.db import models

class UserSession(models.Model):
    user_id = models.IntegerField()
    # Sent to client after successful login via HttpOnly Set-Cookie
    token = models.CharField(unique=True, max_length=50)

class Document(models.Model):
    name = models.CharField(max_length=150)
    author_uid = models.IntegerField()
    identifier = models.CharField(max_length=20, unique=True)
    mime_type = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now=True)
    data = models.BinaryField() # https://docs.djangoproject.com/en/dev/ref/models/fields/#binaryfield
                                # Abusing BinaryField. Although you might think about storing files in
                                # the database, consider that it is bad design in 99% of the cases
    # I feel like the 1% ! :)
    
