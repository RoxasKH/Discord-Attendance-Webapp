from flask import session

from app.repository.discord_repository import DiscordRepository
from app.model.resource import Success, Error

class LoginService():

    repository = DiscordRepository()
    
    def logout(self):
        print(session['oauth2_token']['access_token'])

        response = self.repository.revoke_token()
        
        if response.status_code == 200:
            return Success()
        else:
            return Error(
                message = 'Logout failed.',
                code = 500
            )
    
    def set_session_state(self, scope):
        authorization_url, state = self.repository.get_authorization_state(scope)
        session['oauth2_state'] = state
        print(session)
        return authorization_url
    
    def set_session_token(self, response_url):
        token = self.repository.get_token(
            response_url = response_url
        )
        session['oauth2_token'] = token