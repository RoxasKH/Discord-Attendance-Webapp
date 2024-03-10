import { SignalComponent } from '../components/SignalComponent.js';
import '../components/Message.js';

class Login extends SignalComponent {

  message = null;
  loginButton = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'pages/login.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;

        this.message = this.shadowRoot.querySelector('message-component');
        this.loginButton = this.shadowRoot.querySelector('#login > button');

        this.registerChildComponents([this.message]);
        
      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}

}

if ('customElements' in window) {
  customElements.define('login-page', Login);
}