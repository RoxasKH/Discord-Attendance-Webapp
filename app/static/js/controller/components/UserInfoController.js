import { DialogButtonData } from "../../model/DialogButtonData.js";
import { LocalStorageHelper } from "../../utils/LocalStorageHelper.js";

export class UserInfoController {

    constructor(userinfo, user, dialog) {
        this.userinfo = userinfo;
		this.user = user;
		this.avatar = user.server_avatar || user.avatar;
        this.dialog = dialog;

        this.localStorageHelper = new LocalStorageHelper();
    }

    init() {
        this.userinfo.setUserInfos(
			this.avatar, 
			this.user.username, 
			this.user.discriminator, 
			this.user.server_nickname, 
			this.user.joined_at
		);
		this.userinfo.logoutButton.addEventListener('click', () => {
			// Bind is needed to bind the right context where to call the function
			// Alternative option is to pass an anonymous function
			let logoutButton = new DialogButtonData('Logout', this.#logoutRedirect.bind(this), true);
			this.dialog.show(
				'Are you sure you want to log out from the application?', 
				[ logoutButton ],
				false
			);
		});
    }

    #logoutRedirect() {
		this.localStorageHelper.setBoolean('logged_in', false);
		window.location.replace('/logout'); // Redirect to the logout endpoint
	}

}