from django.db import models
from django.utils import timezone
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
import uuid

class GameUsers(models.Model):
    record_id=models.UUIDField(primary_key=True, default=uuid.uuid4)
    username = models.CharField(max_length=200, unique=True)
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    id = models.BigIntegerField()
    is_bot=models.BooleanField()
    language_code = models.CharField(max_length=4)
    score=models.BigIntegerField(default=0)
    is_blocked=models.BooleanField(default=False)
    message_id=models.CharField(max_length=200)