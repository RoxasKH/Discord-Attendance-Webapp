from flask import Blueprint, request

from app.service.api_service import ApiService

bp = Blueprint('api', __name__, url_prefix = '/api')

api_service = ApiService()

# Use discord token for authorization: both mod role id and user id aren't enough
# You need to both limit the access to external people through the token, but also limit the access to what the user can edit in db
@bp.before_request
def check_authorization():
    user_id = request.headers.get('Authorization-ID')
    api_service.is_authorized(user_id)


@bp.route('/table')
def attendance_table():
    return api_service.get_attendance()


@bp.route('/table/<string:username>', methods = ['PUT'])
def table(username):

    user_id = request.headers.get('Authorization-ID')

    match request.method:
        case 'PUT':
            api_service.check_request(
                request = request,
                parameters_list = ['month', 'attendance']
            )

            month = request.json['month']
            attendance_array = request.json['attendance']

            return api_service.update_user_attendance(
                user_id = user_id,
                username = username,
                month = month,
                attendance_array = attendance_array
            )
            

@bp.route('/reset')
def reset():
    return api_service.reset()