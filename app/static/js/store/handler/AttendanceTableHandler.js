import { Observable } from "../../model/Observable.js";
import { UserAttendanceRepository } from "../../repository/UserAttendanceRepository.js";
import { AttendanceTableState } from "../state/AttendanceTableState.js";

export class AttendanceTableHandler extends Observable {

    #userAttendanceRepository = new UserAttendanceRepository();

    constructor() {
        super(new AttendanceTableState());
    }

    setLoading(isLoading) {
        this.setState(state => ({
            ...state,
            loading: isLoading,
        }));
    }

    setAttendance(attendance) {
        this.setState(state => ({
            ...state,
            usersAttendance: attendance,
            editableAttendance: attendance,
        }))
    }

    setEditableAttendance(attendance) {
        this.setState(state => ({
            ...state,
            editableAttendance: attendance,
        }))
    }

    resetEdits() {
        this.setState(state => ({
            ...state,
            editableAttendance: state.usersAttendance,
        }))
    }

    saveEdits() {
        this.setState(state => ({
            ...state,
            usersAttendance: state.editableAttendance,
        }))
    }

    async refresh(id) {

        this.setLoading(true);
        
        const response = await this.#userAttendanceRepository.getAttendanceData(id);
    
        console.log(response);
    
        let userElementArray = response.filter(element => element.discord_user_id == id);
        let otherUsersArray = response.filter(element => !userElementArray.includes(element));
        let orderedArray = userElementArray.concat(otherUsersArray);
    
        /* TODO */
    
        this.setAttendance(orderedArray);

        this.setLoading(false);
    }

}