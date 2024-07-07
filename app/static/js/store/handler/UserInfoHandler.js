import { Observable } from "../../model/Observable.js";
import { UserInfoState } from "../state/UserInfoState.js";

export class UserInfoHandler extends Observable {

    constructor() {
        super(new UserInfoState());
    }

    toggle() {
        this.setState((state) => ({
            ...state,
            show: !state.show,
        }));
    }

    hide() {
        this.setState((state) => ({
            ...state,
            show: false,
        }));
    }

    setUser(user) {
        this.setState((state) => ({
            ...state,
            user: user,
        }));
    }

}