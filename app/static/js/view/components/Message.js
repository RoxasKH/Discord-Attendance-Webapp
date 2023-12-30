import { SignalComponent } from '../components/SignalComponent.js'
import { MessageTypeEnum } from '../../utils/enums/MessageTypeEnum.js'

class Message extends SignalComponent {

  close_button = null;

  #timer = null;
  #message_container = null;
  #message = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'components/message.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;

        this.#message_container = this.shadowRoot.querySelector('#message-container');
        this.#message = this.shadowRoot.querySelector('#message');

        this.close_button = this.shadowRoot.querySelector('#close');

        this.registerChildComponents();
      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}


  show(message, typeClass) {

    this.#clearTimer();

    if(this.#message)
      this.#message.innerHTML = message;

    Object.keys(MessageTypeEnum).forEach(type => {
      if (MessageTypeEnum[type] instanceof MessageTypeEnum) {
        this.#message_container.classList.remove(MessageTypeEnum[type].name);
      }
    });

    if (typeClass instanceof MessageTypeEnum)
      this.#message_container.classList.add(typeClass.name);

    this.#message_container.classList.add('fadeIn');
    this.#message_container.classList.remove('fadeOut');

    if(typeClass == MessageTypeEnum.SUCCESS) {
      this.#timer = setTimeout(() => 
        this.close(), 
        4000
      );
    }

  }

  close() {
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

  getMessage() {
    return this.#message.textContent;
  }

  isOfType(typeClass) {
    if (typeClass instanceof MessageTypeEnum) {
      return this.#message_container.classList.contains(typeClass.name);
    }
  }

}

if ('customElements' in window) {
  customElements.define('message-component', Message);
}