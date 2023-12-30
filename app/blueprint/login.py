from flask import Blueprint, redirect, request, session, url_for

from app.service.login_service import LoginService
from app.model.resource import Success, Error
from app.util.utils import render_page

bp = Blueprint('login', __name__)

login_service = LoginService()

@bp.route('/')
def index():
    return render_page(page = 'Login')

@bp.route('/login')
def login():
    scope = request.args.get(
        'scope',
        'identify guilds.members.read'
    )
    authorization_url = login_service.set_session_state(scope)
    return redirect(authorization_url)


@bp.route('/callback')
def callback():
    if request.values.get('error'):
        return request.values['error']
    login_service.set_session_token(request.url)
    return redirect(url_for('profile.me'))

@bp.route('/logout')
def logout():
    result = login_service.logout()

    match result:
        case Success():
            return redirect(url_for('.index'))
        case Error():
            raise HttpException(
                message = result.message,
                code = result.code
            )