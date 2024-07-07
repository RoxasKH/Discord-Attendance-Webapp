import { SignalComponent } from './SignalComponent.js';
import { ListenerHandlerSingleton } from '../../utils/ListenerHandlerSingleton.js';

class CustomCursor extends SignalComponent {

  #toolbarState = null;

  listenerHandler = ListenerHandlerSingleton.getInstance();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const store = this.getStore();
    this.#toolbarState = store.toolbarState;
    this.#toolbarState.addObserver(this);
  }

  async connectedCallback() {
    try {
      const htmlPath = this.TEMPLATES_PATH + 'components/custom-cursor.html';

      const response = await fetch(htmlPath);
      const html = await response.text();
      this.shadowRoot.innerHTML = html;

      await this.registerChildComponents();

    } catch (error) {
      console.error('Error loading HTML file:', error);
    }
  }

  update(state) {
    const {selected, tool} = state;
    selected ? this.set(tool) : this.reset();
  }


  set(tool) {

    this.reset();

    let cursor = this.shadowRoot.querySelector('.cursor.' + tool.name);

    document.body.style.cursor = 'none';
    cursor.classList.remove('hide');

    this.listenerHandler.addListener(document.body, 'pointermove', (event) => {
      const mouseY = event.clientY;
      const mouseX = event.clientX;

      cursor.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
    });

  }

  reset() {
    this.listenerHandler.removeAllListeners(document.body, 'pointermove');
    for (const cursor of this.shadowRoot.querySelectorAll('.cursor')) {
      cursor.classList.add('hide');
    }
    document.body.style.cursor = 'auto';
  }

}

if ('customElements' in window) {
  customElements.define('custom-cursor', CustomCursor);
}