import { SignalComponent } from './SignalComponent.js';
import { ListenerHandlerSingleton } from '../../utils/ListenerHandlerSingleton.js';
import { DialogButtonData } from '../../model/DialogButtonData.js';

class Dialog extends SignalComponent {

  #dialogState = null;

  #dialogScreen = null;
  #dialog = null;
  #dialogMessage = null;
  #buttonContainer = null;
  
  loader = null;

  listenerHandler = ListenerHandlerSingleton.getInstance();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const store = this.getStore();
    this.#dialogState = store.dialogState;
    this.#dialogState.addObserver(this);
  }

  async connectedCallback() {
    try {
      const htmlPath = this.TEMPLATES_PATH + 'components/dialog.html';

      const response = await fetch(htmlPath);
      const html = await response.text();
      this.shadowRoot.innerHTML = html;

      this.#dialogScreen = this.shadowRoot.querySelector('#dialog-screen');
      this.#dialog = this.shadowRoot.querySelector('#dialog');
      this.#dialogMessage = this.shadowRoot.querySelector('#dialog-message');
      this.#buttonContainer = this.shadowRoot.querySelector('#dialog-buttons');

      this.loader = this.shadowRoot.querySelector('loader-component');

      await this.registerChildComponents([this.loader]);
    }
    catch(error) {
      console.error('Error loading HTML file:', error);
    }
  }

  update(state) {
    const {
      show,
      message,
      mandatory,
      buttonsList,
      loading,
      cancelFunction
    } = state;

    this.listenerHandler.removeAllListeners(this.#dialogScreen, 'click');
    this.#buttonContainer.replaceChildren(); // Emptying its content

    this.#dialogMessage.textContent = message;

    if (buttonsList) {

      const cancelButton = new DialogButtonData(
        'Cancel', 
        () => { cancelFunction(); }
      );

      buttonsList.unshift(cancelButton);

      for (const button of buttonsList) {
        const button_dom = document.createElement('div');
        button_dom.append(button.name);
        button_dom.addEventListener('click', async () => {
          await button.onClickFunction();
          this.#dialogState.clearCancelFunction();
          this.#dialogState.setMandatory(false);
          this.#dialogState.hide();
        });

        this.#buttonContainer.append(button_dom);

        if(button.highlighted)
          button_dom.classList.add('highlighted');
        else
          button_dom.classList.add('not-highlighted');
      }
      
    }

    if (!mandatory) {
      this.listenerHandler.addListener(this.#dialogScreen, 'click', (event) => {
        if (!event.composedPath().includes(this.#dialog)) {
          this.#dialogState.hide();
        }
      });
    }

    loading ? this.loader.show() : this.loader.hide();

    show ? this.#show() : this.#hide();

  }


  #show() {
    this.#dialogScreen.classList.remove('hide');
    this.#dialogScreen.classList.add('fade-in');
    this.#dialog.classList.add('grow');
  }

  #hide() {
    this.#dialogScreen.classList.add('hide');
    this.#dialogScreen.classList.remove('fade-in');
    this.#dialog.classList.remove('grow');
  }

}

if ('customElements' in window) {
  customElements.define('dialog-component', Dialog);
}