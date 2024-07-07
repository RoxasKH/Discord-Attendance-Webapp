import { DialogButtonData } from '../../model/DialogButtonData.js';
import { DialogState } from '../../store/state/DialogState.js';
import { LocalStorageHelper } from '../../utils/LocalStorageHelper.js';
import { SignalComponent } from './SignalComponent.js';

class User extends SignalComponent {

  #userinfoState = null;
  #dialogState = null;

  #container = null;
  #name = null;
  #discriminator = null;
  #nickname = null;
  #join_time = null;
  #avatar = null;

  logoutButton = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const store = this.getStore();
    this.#userinfoState = store.userinfoState;
    this.#dialogState = store.dialogState;
    this.#userinfoState.addObserver(this);

    this.localStorageHelper = new LocalStorageHelper();
  }

  async connectedCallback() {
    try {
      const htmlPath = this.TEMPLATES_PATH + 'components/user-info.html';

      const response = await fetch(htmlPath);
      const html = await response.text();
      this.shadowRoot.innerHTML = html;

      this.#container = this.shadowRoot.querySelector('#userinfo');

      this.#name = this.shadowRoot.querySelector('#name');
      this.#discriminator = this.shadowRoot.querySelector('#discriminator');
      this.#nickname = this.shadowRoot.querySelector('#nickname');
      this.#join_time = this.shadowRoot.querySelector('#joined_at');
      this.#avatar = this.shadowRoot.querySelector('.avatar');
      this.logoutButton = this.shadowRoot.querySelector('#logout');

      await this.registerChildComponents();

    }
    catch(error) {
      console.error('Error loading HTML file:', error);
    }

  }

  update(state) {

    const {show, user} = state;

    this.#setUserInfos(
      user.server_avatar || user.avatar, 
      user.username, 
      user.discriminator, 
      user.server_nickname, 
      user.joined_at
    );
    this.logoutButton.addEventListener('click', () => {
      // Bind is needed to bind the right context where to call the function
      // Alternative option is to pass an anonymous function
      let logoutButton = new DialogButtonData('Logout', () => { this.#logoutRedirect(); }, true);
      this.#dialogState.setMessage('Are you sure you want to log out from the application?');
      this.#dialogState.setButtons([logoutButton]);
      this.#dialogState.show();
    });

    show ? this.#open() : this.#close();

  }

  #setUserInfos(avatar, username, discriminator = 0, nick, joined_at) {
    this.#avatar.setAttribute('src', avatar);
    this.#name.textContent = username;
    if (Number(discriminator) !== 0)
      this.#discriminator.textContent = '#' + discriminator;
    this.#nickname.textContent = nick;
    this.#join_time.textContent = joined_at;
  }

  #open() {
    this.#container.classList.remove('hide');
    this.#container.classList.remove('bounce-out');
    this.#container.classList.add('bounce-in');
  }

  #close() {
    this.#container.classList.add('bounce-out');
    this.#container.classList.remove('bounce-in');
  }

  #logoutRedirect() {
		this.localStorageHelper.setBoolean('logged_in', false);
		window.location.replace('/logout'); // Redirect to the logout endpoint
	}

}

if ('customElements' in window) {
  customElements.define('user-info', User);
}