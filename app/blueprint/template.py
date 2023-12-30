from flask import Blueprint, render_template

bp = Blueprint('template', __name__, url_prefix = '/templates')

# Needed for JS to be able to fetch all the HTML templates
@bp.route('/<path:filename>')
def serve_template(filename):
    return render_template(filename)