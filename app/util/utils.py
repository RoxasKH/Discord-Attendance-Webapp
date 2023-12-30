from flask import render_template

from .config import Config

config = Config()

_FRONTEND_CONFIG = {
    'HOST_APP_URL': config.HOST_APP_URL
}

# Extend render_template to render pages instead as it always uses the same main template
def render_page(page, data = None):
    if(data is None):
        return render_template(
            'main.html',
            current_page = page,
            config = _FRONTEND_CONFIG
        )
    else:
        return render_template(
            'main.html',
            current_page = page,
            config = _FRONTEND_CONFIG,
            data = data
        )