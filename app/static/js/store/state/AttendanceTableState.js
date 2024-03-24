import { User } from "../../model/User.js";

export class AttendanceTableState {

    loading = false;
    users = [];
    attendance = [];
    daysNumber = 0;

    constructor(
        loading,
        users,
        attendance,
        daysNumber,
    ) {
        this.loading = loading;
        this.users = users;
        this.attendance = attendance;
        this.daysNumber = daysNumber;
    }

}