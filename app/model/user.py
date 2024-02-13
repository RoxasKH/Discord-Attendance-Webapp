from dateutil import parser
from dataclasses import dataclass
from typing import Optional

from app.util.enums.image_extension_enum import ImageExtensionEnum
    
@dataclass
class User:

    _AVATAR_BASE_URL = 'https://cdn.discordapp.com/avatars/'

    joined_at: str
    nick: Optional[str]
    discriminator: int
    id: int
    username: str
    avatar: Optional[str]
    roles: list[str]

    def __post_init__(self):
        # Converting joined datetime from ISO8601 to normal datetime
        self.joined_at = parser.parse(self.joined_at)
        self.avatar = f'{self._AVATAR_BASE_URL}/{self.id}/{self.avatar}.{ImageExtensionEnum.PNG}'