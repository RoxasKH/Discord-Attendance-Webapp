from dateutil import parser
from dataclasses import dataclass

from app.util.enums.image_extension_enum import ImageExtensionEnum

@dataclass
class User():

    _AVATAR_BASE_URL = 'https://cdn.discordapp.com/avatars/'

    def __init__(
        self, 
        joined_at, 
        nick, 
        discriminator, 
        id,
        username,
        avatar,
        roles
    ):
        self.joined_at = parser.parse(joined_at) # Converting joined datetime from ISO8601 to normal datetime
        self.nick = nick
        self.discriminator = discriminator
        self.id = id
        self.username = username
        self.avatar = f'{self._AVATAR_BASE_URL}/{id}/{avatar}.{ImageExtensionEnum.PNG}'
        self.roles = roles