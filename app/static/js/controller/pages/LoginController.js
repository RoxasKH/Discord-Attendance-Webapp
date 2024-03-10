import { LocalStorageHelper } from '../../utils/LocalStorageHelper.js';
import { MessageTypeEnum } from '../../utils/enums/MessageTypeEnum.js';
import { MessageController } from '../components/MessageController.js';

export class LoginController {

	constructor(login, errordata) {
		this.localStorageHelper = new LocalStorageHelper();

		this.error = errordata;

		this.message = login.message;
		this.loginButton = login.loginButton;

		this.messageController = new MessageController(this.message);
	}

	init() {

		this.messageController.init();
		this.#initializeLogin();

		if(this.error) {
		    this.message.show(
		    	"Error: " + this.error.message + ", Code:" + this.error.code, 
		    	MessageTypeEnum.ERROR
		    );
		}
		// localStorage saves data in a string format and you have to convert it to an object with JSON.parse in order to retrieve it
		if(this.localStorageHelper.exists('logged_in') && !this.localStorageHelper.getBoolean('logged_in')) {
		    this.message.show(
		    	"You have successfully logged out from the application", 
		    	MessageTypeEnum.SUCCESS
		    );
		    this.localStorageHelper.removeItem('logged_in');
		}

	}

	#initializeLogin() {
		this.loginButton.addEventListener('click', () => {
			window.location.replace('/login');
		});
	}

}