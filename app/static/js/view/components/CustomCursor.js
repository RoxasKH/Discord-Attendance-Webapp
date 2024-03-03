import { SignalComponent } from './SignalComponent.js'
import { ListenerHandlerSingleton } from '../../utils/ListenerHandlerSingleton.js'

class CustomCursor extends SignalComponent {

  #dialogScreen = null;

  listenerHandler = ListenerHandlerSingleton.getInstance();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'components/custom-cursor.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;

        this.#dialogScreen = this.shadowRoot.querySelector('#dialog-screen');

        this.registerChildComponents();
      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}


  set(tool, toolType) {
    
    this.reset();

    let cursor = this.shadowRoot.querySelector('.cursor.' + toolType.name);

    if(tool.isChecked()) {
      document.body.style.cursor = 'none';
      cursor.classList.remove('hide');

      this.listenerHandler.addListener(document.body, 'mousemove', (event) => {
        const mouseY = event.clientY;
        const mouseX = event.clientX;

        cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      });
    }

  }

  reset() {
    this.listenerHandler.removeAllListeners(document.body, 'mousemove');
    for (const cursor of this.shadowRoot.querySelectorAll('.cursor')) {
      cursor.classList.add('hide');
    }
    document.body.style.cursor = 'auto';
  }

}

if ('customElements' in window) {
  customElements.define('custom-cursor', CustomCursor);
}