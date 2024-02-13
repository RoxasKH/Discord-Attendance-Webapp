from dataclasses import dataclass

@dataclass
class HttpException(Exception):
    message: str
    code: int

@dataclass
class LoginException(HttpException):
    pass