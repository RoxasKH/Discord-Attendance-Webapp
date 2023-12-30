from enum import StrEnum, auto

class MongoDBRequestTypeEnum(StrEnum):
    GET = 'action/findOne'
    GET_MANY = 'action/find'
    POST = 'action/insertOne'
    POST_MANY = 'action/insertMany'
    PUT = 'action/updateOne'
    PUT_MANY = 'action/updateMany'
    DELETE = 'action/deleteOne'
    DELETE_MANY = 'action/deleteMany'