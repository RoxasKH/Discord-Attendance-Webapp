import { SignalComponent } from './SignalComponent.js';
import './UserInfo.js';

class NavigationBar extends SignalComponent {

  #userinfoState = null;

  user = null;
  userinfo = null;
  userAvatar = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const store = this.getStore();
    this.#userinfoState = store.userinfoState;
    this.#userinfoState.addObserver(this);
  }

  async connectedCallback() {
    try {
      const htmlPath = this.TEMPLATES_PATH + 'components/navigation-bar.html';
      const response = await fetch(htmlPath);
      const html = await response.text();

      this.shadowRoot.innerHTML = html;

      this.user = this.shadowRoot.querySelector('#user');
      this.userinfo = this.shadowRoot.querySelector('user-info');
      this.userAvatar = this.shadowRoot.querySelector('.avatar');

      await this.registerChildComponents([this.userinfo]);

      this.#init();
    }
    catch(error) {
      console.error('Error loading HTML file:', error);
    }
  }

  #init() {
    const {userAvatar} = this;
    
		userAvatar.addEventListener('click', () => {
			userAvatar.classList.add('bounce-in');
			userAvatar.addEventListener('animationend', () => {
				userAvatar.classList.remove('bounce-in');
			});
			this.#userinfoState.toggle();
		});
  }

  update(state) {
    const { user } = state;
    const avatar = user.server_avatar || user.avatar;
    this.#setUserAvatar(avatar);
  }

  #setUserAvatar(avatar) {
    this.userAvatar.setAttribute('src', avatar);
  }

}

if ('customElements' in window) {
  customElements.define('navigation-bar', NavigationBar);
}