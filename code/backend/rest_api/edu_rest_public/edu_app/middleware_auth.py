from .models import UserSession
import datetime


AUTH_COOKIE_KEY = "EduSessionToken"
SESSION_LIFETIME_DAYS = 7

class AuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        session = self.__get_request_session(request)
        if session is not None and self.__is_valid_session(session):
            request.session = session
        response = self.get_response(request)
        return response

    def __get_request_session(self, request):
        cookies_header = request.headers.get("Cookie", None)
        if cookies_header is None:
            return None
        cookies = cookies_header.split(";")
        session_token = None
        for cookie in cookies:
            # TO-DO: Thoroughly review this impl, can be broken via malformed headers?
            # (Code is also in docu_rest, it has been copy-pasted)
            cookie_key_value = cookie.strip().split("=")
            if len(cookie_key_value) == 2:
                if cookie_key_value[0] == AUTH_COOKIE_KEY:
                    session_token = cookie_key_value[1]
        if session_token is None:
            return None
        try:
            return UserSession.objects.get(token=session_token)
        except UserSession.DoesNotExist:
            return None
    
    def __is_valid_session(self, user_session):
        # TODO: 1 hour sessions, for development purposes
        return datetime.datetime.now().timestamp() < (user_session.created_at + datetime.timedelta(hours=1)).timestamp()
        #return datetime.datetime.now().timestamp() < (user_session.created_at + datetime.timedelta(days=SESSION_LIFETIME_DAYS)).timestamp()
        
