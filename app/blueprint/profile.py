from flask import Blueprint

from app.service.profile_service import ProfileService
from app.util.utils import render_page

bp = Blueprint('profile', __name__, url_prefix = '/me')

profile_service = ProfileService()

@bp.route('/')
def me():

    user_data = profile_service.create_profile()

    return render_page(
        page = 'Profile',
        data = user_data.__dict__
    )