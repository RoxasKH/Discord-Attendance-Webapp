import json, requests
from requests import Response
from typing import Optional, Dict, Any
from app.model.user import User

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
        collection: str, 
        filters: Optional[Dict[str, str]] = None, 
        document: Optional[Dict[str, any]] = None,
        update: Optional[Dict[str, Dict[str, Any]]] = None
    ) -> Dict[str, Any]:

        json_payload = {
            'collection': collection,
            'database': self.config.DB_DATABASE_NAME,
            'dataSource': self.config.DB_DATA_SOURCE_NAME
        }

        if filters: json_payload['filter'] = filters
        if document: json_payload['document'] = document
        if update: json_payload['update'] = update

        print(json_payload)

        return json.dumps(json_payload)
    

    def get_authorized_roles(self) -> list[str]:

        data = self.__make_request_data(
            collection = self._AUTHORIZATION_COLLECTION, 
            filters = {'type': 'moderator'}
        )
        
        response = requests.post(
            self._BASE_URL + MongoDBRequestTypeEnum.GET.value, 
            headers = self._REQUEST_HEADERS, 
            data = data
        )

        return response.json()['document']['roles']

    def reset_database(self) -> Response:
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

    def get_attendance(self) -> list[Dict[str, Any]]:

        data = self.__make_request_data(
            collection = self._ATTENDANCE_COLLECTION
        )

        response = requests.post(
            self._BASE_URL + MongoDBRequestTypeEnum.GET_MANY.value, 
            headers = self._REQUEST_HEADERS, 
            data = data
        )

        return response.json()['documents']
    
    def update_user_attendance(
        self, 
        user_id: str, 
        username: str, 
        month: str, 
        attendance_array: list[int]
    ) -> Response:

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

    def create_user(self, user: User) -> Response:

        data = self.__make_request_data(
            collection = self._ATTENDANCE_COLLECTION, 
            document = user.__dict__
        )

        return requests.post(
            self._BASE_URL + MongoDBRequestTypeEnum.POST.value, 
            headers = self._REQUEST_HEADERS, 
            data = data
        )