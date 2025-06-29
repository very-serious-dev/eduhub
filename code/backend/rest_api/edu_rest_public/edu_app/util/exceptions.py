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
