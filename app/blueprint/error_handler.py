import traceback
from flask import Blueprint, Response
from werkzeug.exceptions import InternalServerError
from typing import Tuple, Union

from app.model.exception.http_exception import HttpException, LoginException
from app.util.utils import render_page

bp = Blueprint('error_handler', __name__)

@bp.errorhandler(500)
def internal_server_error(error: InternalServerError) -> Tuple[Response, int]:
    print(traceback.format_exc())
    return jsonify({'error': str(e), 'type': str(type(e))}), 500

@bp.errorhandler(HttpException)
def http_server_error(error: HttpException) -> Tuple[Response, int]:
    return jsonify({'error': error.message}), error.code

@bp.errorhandler(LoginException)
def login_server_error(error: LoginException) -> Union[str, Response]:
    return render_page(
        page = 'Login',
        data = {
            'error': error.message, 
            'code': error.code
        }
    )