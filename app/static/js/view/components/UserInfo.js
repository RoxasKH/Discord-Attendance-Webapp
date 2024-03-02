import { SignalComponent } from './SignalComponent.js'

class User extends SignalComponent {

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
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'components/user-info.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;

        this.#container = this.shadowRoot.querySelector('#userinfo');

        this.#name = this.shadowRoot.querySelector('#name');
        this.#discriminator = this.shadowRoot.querySelector('#discriminator');
        this.#nickname = this.shadowRoot.querySelector('#nickname');
        this.#join_time = this.shadowRoot.querySelector('#joined_at');
        this.#avatar = this.shadowRoot.querySelector('.avatar');
        this.logoutButton = this.shadowRoot.querySelector('#logout');

        this.registerChildComponents();
      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}

  setUserInfos(avatar, username, discriminator = 0, nick, joined_at) {
    this.#avatar.setAttribute('src', avatar);
    this.#name.append(username);
    if (discriminator != 0)
      this.#discriminator.append('#' + discriminator);
    this.#nickname.append(nick);
    this.#join_time.append(data.joined_at);
  }

  toggle() {
    this.#container.classList.remove('hide');
    this.#container.classList.toggle('bounce-out');
    this.#container.classList.toggle('bounce-in');
  }

  close() {
    this.#container.classList.add('bounce-out');
    this.#container.classList.remove('bounce-in');
  }

}

if ('customElements' in window) {
  customElements.define('user-info', User);
}