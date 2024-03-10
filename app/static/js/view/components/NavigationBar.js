import { SignalComponent } from './SignalComponent.js';
import './UserInfo.js';

class NavigationBar extends SignalComponent {

  user = null;
  userinfo = null;
  user_avatar = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'components/navigation-bar.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;

        this.user = this.shadowRoot.querySelector('#user');
        this.userinfo = this.shadowRoot.querySelector('user-info');
        this.user_avatar = this.shadowRoot.querySelector('.avatar');

        this.registerChildComponents([this.userinfo]);

      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}

  setUserAvatar(avatar) {
    this.user_avatar.setAttribute('src', avatar);
  }

}

if ('customElements' in window) {
  customElements.define('navigation-bar', NavigationBar);
}