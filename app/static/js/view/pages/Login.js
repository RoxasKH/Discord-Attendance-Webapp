import { SignalComponent } from '../components/SignalComponent.js';
import '../components/Message.js';
import { MessageTypeEnum } from '../../utils/enums/MessageTypeEnum.js';
import { LocalStorageHelper } from '../../utils/LocalStorageHelper.js';

export class Login extends SignalComponent {

  #error = null;
  #messageState = null;

  #message = null;
  #loginButton = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const store = this.getStore();
    this.#messageState = store.messageState;
    
    this.localStorageHelper = new LocalStorageHelper();
  }

  async connectedCallback() {
    try {
      const htmlPath = this.TEMPLATES_PATH + 'pages/login.html';
      const response = await fetch(htmlPath);
      const html = await response.text();
      this.shadowRoot.innerHTML = html;

      this.#loginButton = this.shadowRoot.querySelector('#login > button');
      this.#message = this.shadowRoot.querySelector('message-component');

      await this.registerChildComponents([this.#message]);

      this.#init();

    } catch (error) { 
      console.error('Error loading HTML file:', error);
    }
  }

  #init() {

    this.#loginButton.addEventListener('click', () => {
			window.location.replace('/login');
		});

		if(this.error) {
        this.#messageState.setMessage(`Error: ${this.error.message}, Code: ${this.error.code}`);
        this.#messageState.setType(MessageTypeEnum.ERROR);
        this.#messageState.show();
		}

		if(this.localStorageHelper.exists('logged_in') && !this.localStorageHelper.getBoolean('logged_in')) {
      this.#messageState.setMessage("You have successfully logged out from the application");
      this.#messageState.setType(MessageTypeEnum.SUCCESS);
      this.#messageState.show();
		  
      this.localStorageHelper.removeItem('logged_in');
		}

  }

  set data(data) {
    this.#error = data;
  }
  get data() {
    return this.#error;
  }

}

if ('customElements' in window) {
  customElements.define('login-page', Login);
}