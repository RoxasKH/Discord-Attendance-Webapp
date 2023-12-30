import { LocalStorageHelper } from '../utils/LocalStorageHelper.js'
import { MessageTypeEnum } from '../utils/enums/MessageTypeEnum.js'

export class LoginController {

	constructor(login, data) {
		this.localStorageHelper = new LocalStorageHelper();

		this.data = data;
	
		this.Login = login;

		this.message = login.message;
		this.loginButton = login.loginButton;
	}

	init() {

		this.#initializeMessage();
		this.#initializeLogin();

		if(typeof this.data !== 'undefined') {
		    this.message.show(
		    	"Error: " + this.data.error + ", Code:" + this.data.code, 
		    	MessageTypeEnum.ERROR
		    );
		}
		// localStorage saves data in a string format and you have to convert it to an object with JSON.parse in order to retrieve it
		if(this.localStorageHelper.exists('logged_in') && !JSON.parse(this.localStorageHelper.get.single('logged_in'))) {
		    this.message.show(
		    	"You have successfully logged out from the application", 
		    	MessageTypeEnum.SUCCESS
		    );
		    this.localStorageHelper.clear.single('logged_in');
		}

	}


	#initializeMessage() {
		this.message.close_button.addEventListener('click', () => 
			this.message.close()
		);
	}

	#initializeLogin() {
		this.loginButton.addEventListener('click', () => 
			window.location.replace('/login')
		);
	}

}