from .models import EPUserSession

HTTP_HEADER_AUTH_KEY = "SessionToken"

def get_request_user(request):
    header_token = request.headers.get(HTTP_HEADER_AUTH_KEY, None)
    if header_token is None:
        return None
    try:
        db_session = EPUserSession.objects.get(token=header_token)
        return db_session.user
    except EPUserSession.DoesNotExist:
        return None
