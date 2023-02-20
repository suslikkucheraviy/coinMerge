from django.db import models
from django.utils import timezone
from django.contrib.auth.models import BaseUserManager, AbstractBaseUser, PermissionsMixin
import uuid

class UserManager(BaseUserManager):
    def _create_user(self, email, password, is_staff, is_superuser, **extra_fields):
        if not email:
            raise ValueError('Users must have an email address')

        now = timezone.now()
        user = self.model(
            email=self.normalize_email(email),
            is_staff=is_staff,
            is_active=True,
            is_superuser=is_superuser,
            last_login=now,
            joined_at=now,
            **extra_fields
        )
        user.set_password(password)
        user.save(using=self._db)
        return user

    def get_by_natural_key(self, username):
        return self.get(**{'{}__iexact'.format(self.model.USERNAME_FIELD): username})

    def create_user(self, email, password, **extra_fields):
        return self._create_user(email, password, False, False, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        return self._create_user(email, password, True, True, **extra_fields)

class SiteUser(AbstractBaseUser, PermissionsMixin):
    # id = models.BigAutoField(primary_key=True)
    uuid = models.UUIDField(default=uuid.uuid4, editable=False, unique=True, primary_key=True)
    email = models.EmailField('Email', max_length=255, unique=True)
    name = models.CharField('Name', max_length=255, blank=True)
    surname = models.CharField('Surname', max_length=255, blank=True)
    is_staff = models.BooleanField('Is staff', default=False)
    is_active = models.BooleanField('Is active', default=True)
    joined_at = models.DateTimeField('Joined at', default=timezone.now)

    is_admin=models.BooleanField("Is admin/manager", default=False)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    # def __str__(self):
    #     return str(self.pk)

    class Meta:
        verbose_name = 'SiteUser'
        verbose_name_plural = 'SiteUsers'

    def get_full_name(self):
        return self.name+" "+self.surname

    def get_short_name(self):
        return self.name

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
    average_time = models.FloatField(default=0)
    chat_id=models.BigIntegerField(default=0)

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