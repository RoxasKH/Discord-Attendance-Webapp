from dataclasses import dataclass
from calendar import month_name, monthrange
from datetime import datetime

@dataclass
class AttendanceEntry():

    def __init__(self):
        for month_number, month in enumerate(month_name):
            if(month_number == 0):
                continue
            else:
                setattr(
                    self, 
                    month, 
                    [0 for i in range(monthrange(datetime.now().year, month_number)[1])]
                )

@dataclass
class AttendanceDatabaseEntry():

    def __init__(
        self, 
        discord_user_id = '', 
        discord_user_name = '', 
        discord_user_discriminator = '', 
        attendance = AttendanceEntry()
    ):
        self.discord_user_id = discord_user_id
        self.discord_user_name = discord_user_name
        self.discord_user_discriminator = discord_user_discriminator
        self.attendance = attendance