from dataclasses import dataclass
from typing import Optional

@dataclass
class User(): 
    id: int
    username: str
    discriminator: int
    display_name: Optional[str]
    avatar: Optional[str]
    joined_at: str
    roles: list[str]
    is_bot: Optional[bool] = None
    banner: Optional[str] = None
    locale: Optional[str] = None
    accent_color: Optional[int] = None
    verified: Optional[bool] = None
    flags: Optional[int] = None
    premium_type: Optional[int] = None
    server_nickname: Optional[str] = None
    server_avatar: Optional[str] = None