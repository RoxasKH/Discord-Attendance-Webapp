from flask import session

from app.repository.discord_repository import DiscordRepository
from app.model.exception.http_exception import HttpException

class LoginService():

    repository = DiscordRepository()
    
    def logout(self):
        print(session.get('oauth2_token').get('access_token'))

        response = self.repository.revoke_token()
        
        if response.status_code != 200:
            raise HttpException(
                message = 'Logout failed.',
                code = 500
            )
    
    def set_session_state(self, scope: list[str]) -> str:
        authorization_url, state = self.repository.get_authorization_state(scope)
        session['oauth2_state'] = state
        print(session)
        return authorization_url
    
    def set_session_token(self, response_url: str):
        token = self.repository.get_token(
            response_url = response_url
        )
        session['oauth2_token'] = token