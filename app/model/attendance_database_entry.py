from dataclasses import dataclass, field
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
    discord_user_id: str = ''
    discord_user_name: str = ''
    discord_user_discriminator: str = ''
    attendance: AttendanceEntry = field(default_factory = AttendanceEntry)