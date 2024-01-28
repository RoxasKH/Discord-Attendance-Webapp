import traceback, json

from app.repository.mongo_db_repository import MongoDBRepository
from app.repository.discord_repository import DiscordRepository
from app.model.exception.http_exception import LoginException
from app.model.user import User

class ProfileService():

    db_repository = MongoDBRepository()
    discord_repository = DiscordRepository()

    def __is_authorized(self, user_roles):
        response = self.db_repository.get_authorized_roles()

        authorized_roles = json.loads(response.text)['document']['roles']

        is_authorized = False
        
        for authorized_role in authorized_roles:
            if authorized_role in user_roles:
                is_authorized = True

        return is_authorized
    
    def __is_user_in_db(self, user_id):
        response = self.db_repository.get_attendance()
        full_table = json.loads(response.text)

        id_exists = False

        for user in full_table['documents']:
            db_id = user['discord_user_id']
            if user_id == db_id:
                id_exists = True
        
        return id_exists


    def create_profile(self):

        try:

            user_guild_info = self.discord_repository.get_user_oauth_data()

            try:
                if user_guild_info['code'] is not None:
                    raise LoginException(
                        message = user_guild_info['message'],
                        code = user_guild_info['code'] 
                    )
            except Exception as e:
                pass
            
            # Create a User object
            user = User(
                joined_at = user_guild_info['joined_at'],
                nick = user_guild_info['nick'],
                discriminator = user_guild_info['user']['discriminator'],
                id = user_guild_info['user']['id'],
                username = user_guild_info['user']['username'],
                avatar = user_guild_info['user']['avatar'],
                roles = user_guild_info['roles'],
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