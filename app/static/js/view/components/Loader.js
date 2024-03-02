import { SignalComponent } from './SignalComponent.js'

class Loader extends SignalComponent {

  #loader = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'components/loader.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;

        this.#loader = this.shadowRoot.querySelector('.loader');

        this.registerChildComponents();
      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}


  show() { this.#loader.style.display = 'inline-block'; }

  hide() { this.#loader.style.display = 'none'; }

}

if ('customElements' in window) {
  customElements.define('loader-component', Loader);
}