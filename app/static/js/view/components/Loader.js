import { SignalComponent } from './SignalComponent.js';

class Loader extends SignalComponent {

  #loader = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  async connectedCallback() {
    try {

      const htmlPath = this.TEMPLATES_PATH + 'components/loader.html';
      const response = await fetch(htmlPath);
      const html = await response.text();
      this.shadowRoot.innerHTML = html;

      this.#loader = this.shadowRoot.querySelector('.loader');

      await this.registerChildComponents();

    } catch (error) {
      console.error('Error loading HTML file:', error);
    }
  }

  show() { this.#loader.style.display = 'inline-block'; }

  hide() { this.#loader.style.display = 'none'; }

}

if ('customElements' in window) {
  customElements.define('loader-component', Loader);
}