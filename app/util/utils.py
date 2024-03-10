from flask import render_template, Response, session
from typing import Optional, Dict, Any, Union

from .config import Config

config = Config()

# Extend render_template to render pages instead as it always uses the same main template
def render_page(page, data: Optional[Dict[str, Any]] = None) -> Union[str, Response]:

    FRONTEND_CONFIG = {
        'HOST_APP_URL': config.HOST_APP_URL,
        'DISCORD_API_VERSION': config.DISCORD_API_VERSION,
        'OAUTH2_TOKEN': session.get('oauth2_token').get('access_token')
    }

    return render_template(
        'main.html',
        current_page = page,
        config = FRONTEND_CONFIG,
        data = data
    )