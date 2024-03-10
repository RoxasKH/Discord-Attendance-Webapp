import traceback, json

from app.repository.mongo_db_repository import MongoDBRepository
from app.repository.discord_repository import DiscordRepository
from app.model.exception.http_exception import LoginException
from app.model.user import User

class ProfileService():

    db_repository = MongoDBRepository()
    discord_repository = DiscordRepository()

    def __is_authorized(self, user_roles: list[str]) -> bool:
        authorized_roles = self.db_repository.get_authorized_roles()

        is_authorized = False
        
        for authorized_role in authorized_roles:
            if authorized_role in user_roles:
                is_authorized = True

        return is_authorized
    
    def __is_user_in_db(self, user_id: str) -> bool:
        full_table = self.db_repository.get_attendance()

        id_exists = False

        for user in full_table:
            db_id = user.get('discord_user_id')
            if user_id == db_id:
                id_exists = True
        
        return id_exists


    def create_profile(self) -> User:

        try:

            user_guild_info = self.discord_repository.get_user_oauth_data()

            try:
                if user_guild_info.get('code') is not None:
                    raise LoginException(
                        message = user_guild_info.get('message'),
                        code = user_guild_info.get('code') 
                    )
            except Exception as e:
                pass

            print(user_guild_info)

            user_info = user_guild_info.get('user')
            
            # Wrap info into a User object
            user = User(
                id = user_info.get('id'),
                username = user_info.get('username'),
                discriminator = user_info.get('discriminator'),
                display_name = user_info.get('global_name'),
                avatar = user_info.get('avatar'),
                joined_at = user_guild_info.get('joined_at'),
                roles = user_guild_info.get('roles'),
                is_bot = user_info.get('bot'),
                banner = user_info.get('banner'),
                locale = user_info.get('locale'),
                accent_color = user_info.get('accent_color'),
                verified = user_info.get('verified'),
                flags = user_info.get('flags'),
                premium_type = user_info.get('premium_type'),
                server_nickname = user_guild_info.get('nick'),
                server_avatar = user_guild_info.get('avatar'),
            )

            # Checking if they have permissions as mods
            # Implement auto-deleting the account if they're not a mod but they're in the db

            if not self.__is_authorized(user.roles):
                raise LoginException(
                    message = 'Unauthorized',
                    code = 401
                )

            # Checking if the user is already present in the table db
            # If the user is not already present in the table db, add a db entry

            if not self.__is_user_in_db(user.id):
                db_entry = AttendanceDatabaseEntry(
                    discord_user_id = user.id,
                    discord_user_name = user.username,
                    discord_user_discriminator = user.discriminator
                )
                response = self.db_repository.create_user(db_entry)

            return user

        except Exception as e:
            print(traceback.format_exc())
            raise LoginException(
                    message = str(e),
                    code = 500
                )