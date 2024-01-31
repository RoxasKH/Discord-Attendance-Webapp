import json

from app.repository.mongo_db_repository import MongoDBRepository
from app.model.exception.http_exception import HttpException

class ApiService():

    repository = MongoDBRepository()

    # Right now, it searches for a user in db with the authorization id, but it should also check different
    # permission levels to know if they can also edit other users data

    def __is_user_in_db(self, user_id):
        response = self.repository.get_attendance()
        full_table = json.loads(response.text)

        authorized = False

        for user in full_table['documents']:
            if user['discord_user_id'] == user_id:
                authorized = True
        
        return authorized
    
    def is_authorized(self, user_id):
        if user_id is None:
            raise HttpException(
                message = 'Missing authorization header',
                code = 400
            )
        
        if not self.__is_user_in_db(user_id):
            raise HttpException(
                message = 'Unauthorized user id',
                code = 401
            )

    def get_attendance(self):
        response = self.repository.get_attendance()
        return json.loads(response.text)
    
    def reset(self):
        response = self.repository.reset_database()
        return json.loads(response.text)
    
    def check_request(self, parameters_list, request):

        parameter_string = ''
        keys = request.json.keys()

        if(request.headers.get('Content-Type') == 'application/json'):
            for parameter in parameters_list:
                parameter_string += parameter
            
            for key in keys:
                parameter_string = parameter_string.replace(key, '', 1)
            
            if not ((len(request.json) == len(parameters_list)) and (parameter_string == '')):
                raise HttpException(
                    message = 'invalid request parameters',
                    code = 400
                )
        else:
            raise HttpException(
                message = 'request Content-Type needs to be json',
                code = 400
            )
        
    
    def update_user_attendance(self, user_id, username, month, attendance_array):
        response = self.repository.update_user_attendance(
            user_id = user_id,
            username = username,
            month = month,
            attendance_array = attendance_array
        )
        return json.loads(response.text)