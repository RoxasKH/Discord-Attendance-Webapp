import os
from configparser import ConfigParser, ExtendedInterpolation
from typing import Dict

from .enums.environment_variable_enum import EnvironmentVariableEnum
from .singleton import Singleton

# Using a metaclass to create singletons: https://stackoverflow.com/q/6760685

class Config(metaclass = Singleton):

    DISCORD_API_VERSION = 9

    def __init__(self):

        config: Dict[str, str] = {}

        # Populate config from environment variables
        for variable in EnvironmentVariableEnum:
            if variable.name in os.environ:
                config[variable.name] = os.getenv(variable.name)

        # Create a parser with extended interpolation to understand references to other ini variables
        configParser = ConfigParser(interpolation = ExtendedInterpolation())
        # Disable lowercased keys by default
        configParser.optionxform = str

        # Read values from the config file
        config_file_path = 'app/config.ini'

        if os.path.isfile(config_file_path):
            with open(config_file_path) as stream:
                # Prepend a default ini header to be able to parse it
                configParser.read_string('[DEFAULT]\n' + stream.read())
            config.update(configParser['DEFAULT'])
        else:
            print('Error: missing configuration file')
        
        # Takes the config dict and convert it to class attributes
        for key, value in config.items():
            setattr(self, key, value)
    

    def __str__(self):
        str = f'{type(self).__name__}(\n'
        for attr in dir(self.__class__):
            if not attr.startswith('__'):
                str += f'\t{attr}: {getattr(self.__class__, attr)}\n'
        for key, value in vars(self).items():
            str += f'\t{key}: {value}\n'
        str += ')'
        return str