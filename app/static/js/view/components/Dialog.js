import { SignalComponent } from './SignalComponent.js'
import { ListenerHandlerSingleton } from '../../utils/ListenerHandlerSingleton.js'
import { DialogButtonData } from '../../model/DialogButtonData.js'

class Dialog extends SignalComponent {

  #dialogScreen = null;
  #dialog = null;
  #dialogMessage = null;
  #buttonContainer = null;
  
  loader = null;

  listenerHandler = ListenerHandlerSingleton.getInstance();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'components/dialog.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;

        this.#dialogScreen = this.shadowRoot.querySelector('#dialog-screen');
        this.#dialog = this.shadowRoot.querySelector('#dialog');
        this.#dialogMessage = this.shadowRoot.querySelector('#dialog-message');
        this.#buttonContainer = this.shadowRoot.querySelector('#dialog-buttons');

        this.loader = this.shadowRoot.querySelector('loader-component');

        this.registerChildComponents([this.loader]);
        
      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}


  show(message, buttonList, mandatory, cancelFunction = () => {}) {

    this.listenerHandler.removeAllListeners(this.#dialogScreen, 'click');
    this.#dialogMessage.replaceChildren(); // Emptying its content
    this.#buttonContainer.replaceChildren();

    this.#dialogScreen.classList.remove('hide');
    this.#dialogScreen.classList.add('fade-in');
    this.#dialog.classList.add('grow');
    this.#dialogMessage.append(message);

    let cancelButton = new DialogButtonData(
      'Cancel', 
      () => { cancelFunction(); this.hide(); }
    );

    buttonList.unshift(cancelButton);

    buttonList.forEach(button => {
      let button_dom = document.createElement('div');
      button_dom.append(button.name);
      button_dom.addEventListener('click', () => {
        button.onClickFunction();
      });

      this.#buttonContainer.append(button_dom);

      if(button.highlighted)
        button_dom.classList.add('highlighted');
      else
        button_dom.classList.add('not-highlighted');
    });

    if(!mandatory) {
      this.listenerHandler.addListener(this.#dialogScreen, 'click', (event) => {
        if (!event.composedPath().includes(this.#dialog)) {
          this.hide();
        }
      });
    }

  }

  hide() {
    this.#dialogScreen.classList.add('hide');
    this.#dialogScreen.classList.remove('fade-in');
    this.#dialog.classList.remove('grow');
  }

}

if ('customElements' in window) {
  customElements.define('dialog-component', Dialog);
}