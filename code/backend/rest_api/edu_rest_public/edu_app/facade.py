from .endpoints_admin import get_admin_home
from .preconditions import maybe_unhappy, Unsupported

@maybe_unhappy
def admin_home(request):
    if request.method == "GET":
        return get_admin_home(request)
    else:
        raise Unsupported
