import json, re
from django.http import JsonResponse

"""
Decorators
"""
def maybe_unhappy(endpoint_function):
    def wrapped(*args, **kwargs):
        try:
            return endpoint_function(*args, **kwargs)
        except BadRequest:
            return JsonResponse({"error": "La petición no es válida o faltan parámetros"}, status=400)
        except BadRequestInvalidPassword:
            return JsonResponse({"error": "La contraseña debe tener por lo menos 8 caracteres"}, status=400)
        except BadRequestInvalidUsername:
            return JsonResponse({"error": "El nombre de usuario no es válido. Sólo puede contener letras en minúscula, dígitos y puntos (.)"}, status=400)
        except BadRequestInvalidTag:
            return JsonResponse({"error": "El tag no es válido. Sólo puede contener letras y dígitos"}, status=409)
        except BadRequestInvalidYear:
            return JsonResponse({"error": "Año inválido. Sólo puede contener dígitos y guiones"}, status=409)
        except Unauthorized:
            return JsonResponse({"error": "Tu sesión no existe o ha caducado"}, status=401)
        except Forbidden:
            return JsonResponse({"error": "No tienes permisos suficientes"}, status=403)
        except NotFound:
            return JsonResponse({"error": "¡Lo que buscas no está por aquí!"}, status=404)
        except Unsupported:
            return JsonResponse({"error": "Método HTTP no soportado"}, status=405)
        except ConflictUserAlreadyExists:
            return JsonResponse({"error": "Ese usuario ya está registrado"}, status=409)
        except ConflictGroupAlreadyExists:
            return JsonResponse({"error": "Ese grupo ya está registrado"}, status=409)
        except InternalError:
            return JsonResponse({"error": "Error interno del servidor. Por favor, contacta con un administrador"}, status=500)
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

"""
Helpers
"""
def expect_body_with(*args, **kwargs):
    request = kwargs.get('request')
    if request is None:
        raise InternalError
    if len(request.body) == 0:
        raise BadRequest
    try:
        json_body = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise BadRequest
    result = ()
    for arg in args:
        try:
            result += json_body[arg],
        except ValueError:
            raise BadRequest
    optional = kwargs.get('optional')
    if optional is not None:
        for opt_arg in optional:
            result += json_body.get(opt_arg),
    return result

def validate_password(password):
    if len(password) < 8:
        raise BadRequestInvalidPassword

def validate_username(username):
    if not(re.match("^[a-z0-9.]+$", username)) or len(username) < 1:
        raise BadRequestInvalidUsername

def validate_tag(tag):
    if not(re.match("^[A-Za-z0-9]+$", tag)) or len(tag) < 1:
        raise BadRequestInvalidTag

def validate_year(year):
    if not(re.match("^[0-9-]+$", year)) or len(year) < 1:
        raise BadRequestInvalidYear
    
def get_from_db(model, *args, **kwargs):
    try:
        return model.objects.get(*args, **kwargs)
    except model.DoesNotExist:
        raise NotFound
    
"""
Errors
"""
class BadRequest(Exception):
    pass

class BadRequestInvalidPassword(Exception):
    pass

class BadRequestInvalidUsername(Exception):
    pass

class BadRequestInvalidTag(Exception):
    pass

class BadRequestInvalidYear(Exception):
    pass
    
class Unauthorized(Exception):
    pass

class Forbidden(Exception):
    pass

class NotFound(Exception):
    pass

class Unsupported(Exception):
    pass

class ConflictUserAlreadyExists(Exception):
    pass

class ConflictGroupAlreadyExists(Exception):
    pass

class InternalError(Exception):
    pass
