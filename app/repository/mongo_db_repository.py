import json, requests

from app.util.config import Config
from app.util.enums.mongo_db_request_type_enum import MongoDBRequestTypeEnum
from app.model.attendance_database_entry import AttendanceEntry

class MongoDBRepository():

    config = Config()

    _BASE_URL = config.DB_URL_ENDPOINT
    
    _ATTENDANCE_COLLECTION = config.DB_ATTENDANCE_COLLECTION
    _AUTHORIZATION_COLLECTION = config.DB_AUTHORIZATION_COLLECTION

    _REQUEST_HEADERS = {
        'Content-Type': 'application/json',
        'Access-Control-Request-Headers': '*',
        'api-key': config.DB_API_KEY
    }
    
    def __make_request_data(
        self, 
        collection, 
        filters = None, 
        document = None,
        update = None
    ):
        json_payload = {
            'collection': collection,
            'database': self.config.DB_DATABASE_NAME,
            'dataSource': self.config.DB_DATA_SOURCE_NAME
        }

        if filters is not None:
            json_payload['filter'] = filters

        if document is not None:
            json_payload['document'] = document
        
        if update is not None:
            json_payload['update'] = update

        print(json_payload)

        return json.dumps(json_payload)
    
    def get_authorized_roles(self):

        data = self.__make_request_data(
            collection = self._AUTHORIZATION_COLLECTION, 
            filters = {'type': 'moderator'}
        )
        
        return requests.post(
            self._BASE_URL + MongoDBRequestTypeEnum.GET.value, 
            headers = self._REQUEST_HEADERS, 
            data = data
        )

    
    def reset_database(self):
        json_set = {'$set': {'attendance': AttendanceEntry().__dict__}}

        data = self.__make_request_data(
            collection = self._ATTENDANCE_COLLECTION,
            filters = {}, # empty filter affect all the documents in the collection
            update = json_set
        )

        return requests.post(
            self._BASE_URL + MongoDBRequestTypeEnum.PUT_MANY.value, 
            headers = self._REQUEST_HEADERS, 
            data = data
        )

    
    def get_attendance(self):

        data = self.__make_request_data(
            collection = self._ATTENDANCE_COLLECTION
        )

        return requests.post(
            self._BASE_URL + MongoDBRequestTypeEnum.GET_MANY.value, 
            headers = self._REQUEST_HEADERS, 
            data = data
        )
    
    def update_user_attendance(self, user_id, username, month, attendance_array):

        json_set = {'$set': {'attendance.' + month: attendance_array}}

        data = self.__make_request_data(
            collection = self._ATTENDANCE_COLLECTION, 
            filters = {
                'discord_user_id': user_id, 
                'discord_user_name': username
            },
            update = json_set
        )

        return requests.post(
            self._BASE_URL + MongoDBRequestTypeEnum.PUT.value, 
            headers = self._REQUEST_HEADERS, 
            data = data
        )

    def create_user(self, user):

        data = self.__make_request_data(
            collection = self._ATTENDANCE_COLLECTION, 
            document = user.__dict__
        )

        return requests.post(
            self._BASE_URL + MongoDBRequestTypeEnum.POST.value, 
            headers = self._REQUEST_HEADERS, 
            data = data
        )