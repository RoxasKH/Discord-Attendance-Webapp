import { Observable } from "../../model/Observable.js";
import { MessageTypeEnum } from "../../utils/enums/MessageTypeEnum.js";
import { MessageState } from "../state/MessageState.js";

export class MessageHandler extends Observable {

    constructor() {
        super(new MessageState());
    }

    show() {
        this.setState(state => ({
            ...state,
            show: true,
        }));
    }

    hide() {
        this.setState(state => ({
            ...state,
            show: false,
        }));
    }

    setMessage(message) {
        this.setState(state => ({
            ...state,
            message: message,
        }));
    }

    setType(messageType) {
        this.setState(state => ({
            ...state,
            type: messageType,
        }));
    }

    showUserAttendanceRepositoryError(status, description, error) {
        this.setMessage(`
            <div><b>Status:</b> &#10006; Error </div> <br>
            <div><b>Error Type:</b> ${status} - ${description}</div>
            <div><b>Description:</b> ${error}</div>
        `);
        this.setType(MessageTypeEnum.ERROR);
        this.show();
    }

    

}