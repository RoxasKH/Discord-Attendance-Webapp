import traceback
from flask import Blueprint

from app.util.http_exception import HttpException

bp = Blueprint('error_handler', __name__)

@bp.errorhandler(500)
def internal_server_error(error):
    print(traceback.format_exc())
    return jsonify({'error': str(e), 'type': str(type(e))}), 500

@bp.errorhandler(HttpException)
def internal_server_error(error):
    return jsonify({'error': error.message}), error.status_code