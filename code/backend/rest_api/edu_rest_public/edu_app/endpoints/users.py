import bcrypt, json, secrets, datetime
from django.http import JsonResponse
from django.db.models import Q
from django.utils import timezone
from .. import constants
from ..models import User, UserSession, FailedLoginAttempt
from ..util.serializers import roles_array, users_array_to_json
from ..util.helpers import get_from_db
from ..util.exceptions import ForbiddenExceededLoginAttempts, NotFound, UnauthorizedIncorrectPassword

def search(request, q):
    users = User.objects.filter(archived=False)
    if q is not None:
        users = users.filter(Q(username__icontains=q) | Q(name__icontains=q) | Q(surname__icontains=q))
    return JsonResponse({"users": users_array_to_json(users)})

def login(request, username, password):
    yesterday = timezone.now() - datetime.timedelta(days=1)
    if FailedLoginAttempt.objects.filter(username=username, datetime__gte=yesterday).count() > constants.MAX_FAILED_LOGINS_IN_24_HOURS:
        raise ForbiddenExceededLoginAttempts
    try:
        user = User.objects.get(username=username, archived=False)
    except User.DoesNotExist:
        fla = FailedLoginAttempt()
        fla.username = username
        fla.client_ip = request.META.get('REMOTE_ADDR')
        fla.client_user_agent = request.META.get('HTTP_USER_AGENT')
        fla.save()
        raise NotFound
    if bcrypt.checkpw(password.encode('utf8'), user.encrypted_password.encode('utf8')):
        # Password is correct. Has the password expired, though?
        must_reset_password = user.last_password_change is None or timezone.now() > (user.last_password_change + datetime.timedelta(days=constants.PASSWORD_DAYS_TO_EXPIRE))
        if must_reset_password:
            password_reset_token = secrets.token_hex(constants.RESET_PASSWORD_TOKEN_SIZE) #NICE-TO-HAVE: Make this token expire after a short time (5 min)
            user.password_reset_token = password_reset_token
            user.save()
            return JsonResponse({"success": False,
                                 "reason": "Por favor, establece una nueva contraseña" if user.last_password_change is None else "Tu contraseña está caducada",
                                 "password_reset_token": password_reset_token})
        else:
            random_token = secrets.token_hex(constants.SESSION_TOKEN_SIZE)
            random_one_time_token = secrets.token_hex(constants.ONE_TIME_TOKEN_SIZE)
            session = UserSession()
            session.user = user
            session.token = random_token
            session.one_time_token = random_one_time_token
            session.save()
            response = JsonResponse({"success": True,
                                    "one_time_token": random_one_time_token,
                                    "session_info": {
                                        "username": user.username,
                                        "roles": roles_array(user),
                                        "max_storage": {
                                            "folders": user.max_folders,
                                            "documents": user.max_documents,
                                            "bytes": user.max_documents_size
                                        }
                                    }}, status=201)
            response.set_cookie(key=constants.AUTH_COOKIE_KEY, value=random_token, path="/", samesite="Strict", httponly=True) # TO-DO: Should be secure=True too when using HTTPS
            return response
    else:
        fla = FailedLoginAttempt()
        fla.username = username
        fla.client_ip = request.META.get('REMOTE_ADDR')
        fla.client_user_agent = request.META.get('HTTP_USER_AGENT')
        fla.save()
        raise UnauthorizedIncorrectPassword

def logout(request):
    request.session.delete()
    return JsonResponse({"success": True}, status=200)

def reset_password(request, password, new_password, password_reset_token):
    user = get_from_db(User, password_reset_token=password_reset_token, archived=False)
    if bcrypt.checkpw(password.encode('utf8'), user.encrypted_password.encode('utf8')):
        user.password_reset_token = None
        user.encrypted_password = bcrypt.hashpw(new_password.encode('utf8'), bcrypt.gensalt()).decode('utf8')
        user.last_password_change = timezone.now()
        user.save()
        return JsonResponse({"success": True})
    else:
        raise UnauthorizedIncorrectPassword
