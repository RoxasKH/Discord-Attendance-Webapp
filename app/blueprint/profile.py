from flask import Blueprint

from app.service.profile_service import ProfileService
from app.util.utils import render_page
from app.model.resource import Success, Error

bp = Blueprint('profile', __name__, url_prefix = '/me')

profile_service = ProfileService()

@bp.route('/')
def me():

    result = profile_service.create_profile()

    match result:
        case Success():
            return render_page(
                page = 'Profile',
                data = result.data.__dict__
            )
        case Error():
            return render_page(
                page = 'Login',
                data = {
                    'error': result.message, 
                    'code': result.code
                }
            )