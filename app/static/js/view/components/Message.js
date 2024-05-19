import { SignalComponent } from './SignalComponent.js';
import { MessageTypeEnum } from '../../utils/enums/MessageTypeEnum.js';

class Message extends SignalComponent {

  #timer = null;
  #message_container = null;
  #message = null;
  #close_button = null;

  #messageState = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const store = this.getStore();
    this.#messageState = store.messageState;
    this.#messageState.addObserver(this);
  }

  async connectedCallback() {
    try {
      const htmlPath = this.TEMPLATES_PATH + 'components/message.html';

      const response = await fetch(htmlPath);
      const html = await response.text();
      this.shadowRoot.innerHTML = html;
  
      this.#message_container = this.shadowRoot.querySelector('#message-container');
      this.#message = this.shadowRoot.querySelector('#message');
      this.#close_button = this.shadowRoot.querySelector('#close');
  
      await this.registerChildComponents();
  
      this.#init();
    }
    catch(error) {
      console.error('Error loading HTML file:', error);
    }
  }

  #init() {
    this.#close_button.addEventListener('click', () => {
      this.#messageState.hide();
    });
  }

  update(state) {

    const { message, type, show } = state;

    this.#clearTimer();

    this.#message.innerHTML = message;

    for (const type of Object.keys(MessageTypeEnum)) {
      this.#message_container.classList.remove(MessageTypeEnum[type].name);
    }

    this.#message_container.classList.add(type.name);

    show ? this.#show(type) : this.#close();
    
  }

  #show(typeClass) {

    this.#message_container.classList.add('fadeIn');
    this.#message_container.classList.remove('fadeOut');

    if(typeClass === MessageTypeEnum.SUCCESS) {
      this.#timer = setTimeout(() =>
        this.#messageState.hide(),
        4000
      );
    }

  }

  #close() {
    this.#clearTimer();
    this.#message_container.classList.remove('fadeIn');
    this.#message_container.classList.add('fadeOut');
  }

  #clearTimer() {
    if(this.#timer) {
      clearTimeout(this.#timer);
      this.#timer = null;
    }
  }

}

if ('customElements' in window) {
  customElements.define('message-component', Message);
}