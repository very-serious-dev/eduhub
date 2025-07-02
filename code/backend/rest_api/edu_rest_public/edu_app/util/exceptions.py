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

class UnauthorizedIncorrectPassword(Exception):
    pass

class Forbidden(Exception):
    pass

class ForbiddenAssignmentSubmit(Exception):
    pass

class ForbiddenExceededLoginAttempts(Exception):
    pass

class NotFound(Exception):
    pass

class Unsupported(Exception):
    pass

class ConflictUserAlreadyExists(Exception):
    pass

class ConflictGroupAlreadyExists(Exception):
    pass

class ConflictUnitAlreadyExists(Exception):
    pass

class ConflictFolderAlreadyExists(Exception):
    pass

class ConflictQuotaExceeded(Exception):
    pass

class InternalError(Exception):
    pass
