from .models import EPUserSession

AUTH_COOKIE_KEY = "SessionToken"

class AuthMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request.user = self.__get_request_user(request)
        response = self.get_response(request)
        return response

    def __get_request_user(self, request):
        cookies_header = request.headers.get("Cookie", None)
        if cookies_header is None:
            return None
        cookies = cookies_header.split(";")
        session_token = None
        for cookie in cookies:
			# TO-DO: Thoroughly review this impl, can be broken via malformed headers?
            cookie_key_value = cookie.strip().split("=")
            if len(cookie_key_value) == 2:
                if cookie_key_value[0] == AUTH_COOKIE_KEY:
                    session_token = cookie_key_value[1]
        if session_token is None:
            return None
        try:
            db_session = EPUserSession.objects.get(token=session_token)
            return db_session.user
        except EPUserSession.DoesNotExist:
            return None
