import { User } from "../../model/User.js";

export class UserInfoState {

    show = false;
    user = new User();

    constructor(
        show,
        user
    ) {
        this.show = show;
        this.user = user;
    }

}