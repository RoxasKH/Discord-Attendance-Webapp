import { SignalComponent } from './SignalComponent.js';
import '../../utils/Utils.js';

class Select extends SignalComponent {

  #toolbarState = null;
  
  labelTextBox = null;
  selectContainer = null;
  select = null;
  selectedValue = null;
  optionsContainer = null;

  label = "";
  values = [];
  currentValue = null;
  onSelect = (value) => {};

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const store = this.getStore();
    this.#toolbarState = store.toolbarState;

  }

  async connectedCallback() {
    try {
      const htmlPath = this.TEMPLATES_PATH + 'components/select.html';
      const response = await fetch(htmlPath);
      const html = await response.text();
      this.shadowRoot.innerHTML = html;

      this.labelTextBox = this.shadowRoot.querySelector('.label');
      this.selectContainer = this.shadowRoot.querySelector('.select-container');
      this.select = this.shadowRoot.querySelector('.select');
      this.selectedValue = this.shadowRoot.querySelector('.selected-value');
      this.optionsContainer = this.shadowRoot.querySelector('.options');

      await this.registerChildComponents();

    }
    catch(error) {
      console.error('Error loading HTML file:', error);
    }

  }

  init(label, values, currentValue, onSelect) {
    this.label = label;
    this.values = values;
    this.currentValue = currentValue;
    this.onSelect = onSelect;

    this.labelTextBox.textContent = this.label;
    this.#generateOptions();

    this.selectedValue.textContent = this.currentValue.capitalize();
    this.onSelect(this.currentValue);
    this.#disableSelectedOption();

    this.select.addEventListener('click', () => { this.#toggleOptions(); });

    document.addEventListener('click', (event) => {
      if (!event.composedPath().includes(this.selectContainer)) {
        this.#hideOptions();
      }
    });
  }

  #generateOptions() {
    this.optionsContainer.replaceChildren();
    for (const value of this.values) {
        const option = document.createElement('div');
        option.classList.add('option');
        option.textContent = value.capitalize();
        option.addEventListener('click', () => {
            this.selectedValue.textContent = value.capitalize();
            this.onSelect(value);
            this.currentValue = value;
            this.#disableSelectedOption();
            this.#hideOptions();
        });
        this.optionsContainer.append(option);
    }
  }

  #disableSelectedOption() {
    const options = this.optionsContainer.querySelectorAll('.option');
    for (const option of options) {
      option.classList.remove('disabled');
      console.log(`${option.textContent.toLowerCase()} vs ${this.currentValue}`);
      console.log(option.textContent.toLowerCase() == this.currentValue);
      if (option.textContent.toLowerCase() === this.currentValue) {
        option.classList.add('disabled');
      }
    }
  }

  #showOptions() {
    this.optionsContainer.style.visibility = 'visible';
    this.optionsContainer.style.opacity = 1;
    this.optionsContainer.style.bottom = "110%";
  }

  #hideOptions() {
    this.optionsContainer.style.visibility = 'collapse';
    this.optionsContainer.style.opacity = 0;
    this.optionsContainer.style.bottom = "80%";
  }

  #toggleOptions() {
    this.optionsContainer.style.visibility == 'visible' 
      ? this.#hideOptions()
      : this.#showOptions()
  }

}

if ('customElements' in window) {
  customElements.define('select-component', Select);
}