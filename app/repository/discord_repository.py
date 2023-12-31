import requests
from flask import session
from requests_oauthlib import OAuth2Session

from app.util.config import Config

class DiscordRepository():

    config = Config()

    _SERVER_ID = config.SERVER_ID

    _BASE_URL = 'https://discordapp.com/api'
    _AUTHORIZATION_URL = f'{_BASE_URL}/oauth2/authorize'
    _TOKEN_URL = f'{_BASE_URL}/oauth2/token'

    _OAUTH2_REDIRECT_URL = f'{config.HOST_APP_URL}/callback'
    _OAUTH2_CLIENT_ID = config.OAUTH2_CLIENT_ID
    _OAUTH2_CLIENT_SECRET = config.OAUTH2_CLIENT_SECRET

    def __token_updater(self, token):
        session['oauth2_token'] = token

    def __make_session(self, token = None, state = None, scope = None):
        return OAuth2Session(
            client_id = self._OAUTH2_CLIENT_ID,
            token = token,
            state = state,
            scope = scope,
            redirect_uri = self._OAUTH2_REDIRECT_URL,
            auto_refresh_kwargs = {
                'client_id': self._OAUTH2_CLIENT_ID,
                'client_secret': self._OAUTH2_CLIENT_SECRET,
            },
            auto_refresh_url = self._TOKEN_URL,
            token_updater = self.__token_updater
        )


    def get_user_oauth_data(self):
        discord_oauth2_session = self.__make_session(token = session.get('oauth2_token'))
        return discord_oauth2_session.get(
            self._BASE_URL + '/users/@me/guilds/' + self._SERVER_ID + '/member'
        ).json()

    def get_token(self, response_url):
        discord_oauth2_session = self.__make_session(state = session.get('oauth2_state'))
        return discord_oauth2_session.fetch_token(
            self._TOKEN_URL,
            client_secret = self._OAUTH2_CLIENT_SECRET,
            authorization_response = response_url
        )
    
    def get_authorization_state(self, scope):
        discord_oauth2_session = self.__make_session(scope = scope.split(' '))
        return discord_oauth2_session.authorization_url(self._AUTHORIZATION_URL)

    # Maybe revoke it using requests_oauthlib OAuth2Session method just like you get it
    '''
        POST https://discord.com/api/oauth2/token/revoke
        Content-Type: application/x-www-form-urlencoded
        data:
            client_id: <client_id>
            client_secret: <client_secret>
            token: <access_token>
    '''
    def revoke_token(self):

        headers = {
            'Content-Type': 'application/x-www-form-urlencoded'
        }

        # No json.dumps as we need form-urlencoded
        data = {
            'client_id': self._OAUTH2_CLIENT_ID,
            'client_secret': self._OAUTH2_CLIENT_SECRET,
            'token': session['oauth2_token']['access_token']
        }

        return requests.post(
            self._TOKEN_URL + '/revoke', 
            headers = headers, 
            data = data
        )
    