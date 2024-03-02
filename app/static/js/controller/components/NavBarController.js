export class NavBarController {

    constructor(navbar, avatar) {
        this.navbar = navbar;
        this.avatar = avatar;
        this.userinfo = navbar.userinfo;
    }

    init() {
        let userAvatar = this.navbar.user_avatar;
        
        this.navbar.setUserAvatar(this.avatar);
		userAvatar.addEventListener('click', () => {
			userAvatar.classList.add('bounce-in');
			userAvatar.addEventListener('animationend', () => {
				userAvatar.classList.remove('bounce-in');
			});
			this.userinfo.toggle();
		});
    }

}