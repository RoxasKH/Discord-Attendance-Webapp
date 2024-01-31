from dataclasses import dataclass

@dataclass
class HttpException(Exception):
    
    def __init__(self, message, code):
        self.message = message
        self.code = code

@dataclass
class LoginException(HttpException):
    pass