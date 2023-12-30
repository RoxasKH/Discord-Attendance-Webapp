from enum import Enum, auto

class EnvironmentVariableEnum(Enum):
    FLASK_ENV = auto()
    OAUTH2_CLIENT_ID = auto()
    OAUTH2_CLIENT_SECRET = auto()
    DB_API_KEY = auto()
    SERVER_ID = auto()