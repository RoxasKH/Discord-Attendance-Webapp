from dataclasses import dataclass

@dataclass
class Resource:
    def __init__(self, data = None, message = None, code = None):
        self.data = data
        self.message = message
        self.code = code

@dataclass
class Success(Resource):
    def __init__(self, data = None):
        super().__init__(
            data = data
        )

@dataclass
class Error(Resource):
    def __init__(self, message, code):
        super().__init__(
            message = message, 
            code = code,
        )