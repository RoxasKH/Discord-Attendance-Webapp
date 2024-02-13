from flask import Blueprint, redirect, request, session, url_for, Response
from typing import Union

from app.service.login_service import LoginService
from app.util.utils import render_page

bp = Blueprint('login', __name__)

login_service = LoginService()

@bp.route('/')
def index() -> Union[str, Response]:
    return render_page(page = 'Login')

@bp.route('/login')
def login() -> Response:
    scope = request.args.get(
        'scope',
        'identify guilds.members.read'
    )
    authorization_url = login_service.set_session_state(scope)
    return redirect(authorization_url)


@bp.route('/callback')
def callback() -> Union[str, Response]:
    if request.values.get('error'):
        return request.values['error']
    login_service.set_session_token(request.url)
    return redirect(url_for('profile.me'))

@bp.route('/logout')
def logout() -> Response:
    result = login_service.logout()
    return redirect(url_for('.index'))