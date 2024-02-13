import os
from flask import Flask
from dotenv import load_dotenv

from app.util.enums.environment_type_enum import EnvironmentTypeEnum
from app.util.config import Config
from app.blueprint import login, api, profile, template, error_handler

def create_app() -> Flask:

    # Load the .env file from outside the package
    dotenv_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
    load_dotenv(dotenv_path)

    # Initialize and obtain a Config instance
    config = Config()

    print(config)

    # Create and configure the app
    app = Flask(__name__)

    environment = config.FLASK_ENV

    match environment:
   
        case EnvironmentTypeEnum.PRODUCTION.value:
            # Run the app using Gunicorn or another WSGI server
            # Your production setup here
            app.debug = False
        
        case EnvironmentTypeEnum.DEVELOPMENT.value:
            # Development server using app.run()
            app.debug = True

        case _:
            # Default setup
            app.debug = False

    app.config.from_mapping(
        SECRET_KEY = config.OAUTH2_CLIENT_SECRET,
        #DATABASE = os.path.join(app.instance_path, 'flaskr.sqlite'),
    )

    if 'http://' in config.HOST_APP_URL:
        os.environ['OAUTHLIB_INSECURE_TRANSPORT'] = 'true'
    
    app.register_blueprint(login.bp)
    app.register_blueprint(api.bp)
    app.register_blueprint(profile.bp)
    app.register_blueprint(template.bp)
    app.register_blueprint(error_handler.bp)

    return app