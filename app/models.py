from django.db import models
from django.utils import timezone
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
import uuid


class GameUsers(models.Model):
    record_id=models.UUIDField(primary_key=True, default=uuid.uuid4)
    username = models.CharField(max_length=200, unique=True)
    first_name = models.CharField(max_length=200)
    last_name = models.CharField(max_length=200)
    id = models.BigIntegerField(unique=True)
    is_bot=models.BooleanField()
    language_code = models.CharField(max_length=4)
    score=models.BigIntegerField(default=0)
    is_blocked=models.BooleanField(default=False)
    message_id=models.CharField(max_length=200)
    is_message=models.BooleanField(default=False)

class GameSession(models.Model):
    record_id = models.UUIDField(primary_key=True, default=uuid.uuid4)
    game_user=models.ForeignKey(GameUsers, on_delete=models.CASCADE)
    session_fist_active=models.DateTimeField(default=timezone.now)
    session_last_active=models.DateTimeField(default=timezone.now)
    session_time=models.FloatField(default=0)

    def getUpdateDuration(self):
        print(">>>", (self.session_last_active - self.session_fist_active).total_seconds())
        #
        self.session_time=(self.session_last_active-self.session_fist_active).total_seconds()
        #     # self.save()
        return self.session_time

class ActiveSessionLedger(models.Model):
    game_user=models.OneToOneField(GameUsers, on_delete = models.CASCADE, primary_key = True)
    game_session=models.ForeignKey(GameSession, on_delete=models.CASCADE, null=True)

    def getDuration(self):
        if(self.game_session==None):
            return 0
        else:
            return (self.game_session.getUpdateDuration())