from django.http import HttpResponse
from .. import constants

class CORSMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        if request.method == "OPTIONS":
            # Assume that every OPTIONS request is a preflight request
            # https://developer.mozilla.org/en-US/docs/Glossary/Preflight_request
            response = HttpResponse()
            response["Access-Control-Allow-Methods"] = "PUT, DELETE"

        else:
            response = self.get_response(request)

        response["Access-Control-Allow-Origin"] = constants.ORIGIN_SERVER
        response["Access-Control-Allow-Credentials"] = "true"
        return response
