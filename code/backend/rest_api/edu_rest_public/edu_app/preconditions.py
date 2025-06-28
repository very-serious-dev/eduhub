from django.http import JsonResponse

def maybe_unhappy(endpoint_function):
    def wrapped(*args, **kwargs):
        try:
            return endpoint_function(*args, **kwargs)
        except Unauthorized:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        except Forbidden:
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        except Unsupported:
            return JsonResponse({"error": "Método HTTP no soportado"}, status=405)
    return wrapped

def require_role(roles_list):
    def decorate(endpoint_function):
        def wrapper(*args, **kwargs):
            request = args[0]
            if request.session is None:
                raise Unauthorized
            if request.session.user.role not in roles_list:
                raise Forbidden
            else:
                return endpoint_function(*args, **kwargs)
        return wrapper
    return decorate


class Unauthorized(Exception):
    pass

class Forbidden(Exception):
    pass

class Unsupported(Exception):
    pass
