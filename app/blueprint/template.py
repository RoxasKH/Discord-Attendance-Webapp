from flask import Blueprint, render_template, Response
from typing import Union

bp = Blueprint('template', __name__, url_prefix = '/templates')

# Needed for JS to be able to fetch all the HTML templates
@bp.route('/<path:filename>')
def serve_template(filename: str) -> Union[str, Response]:
    return render_template(filename)