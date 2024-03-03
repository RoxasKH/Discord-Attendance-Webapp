import { SignalComponent } from './SignalComponent.js'
import './PencilTool.js'
import './BrushTool.js'
import '../../utils/Utils.js'

class Toolbar extends SignalComponent {

  #months = [];
  monthCombobox = null;

  current_month = null;
  message = null;
  navbar = null;
  reloadButton = null;
  clearButton = null;
  tools = null;
  pencil = null;
  brush = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const date = new Date();
    for(let month = 0; month < 12; ++month) {
       date.setMonth(month);
       this.#months.push(date.toLocaleString('en-US', {month: 'long'}).toLowerCase());
    }

    this.current_month = (new Date()).toLocaleString('en-US', {month: 'long'}).toLowerCase();
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'components/toolbar.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;


        this.monthCombobox = this.shadowRoot.querySelector('#month');
        this.initializeComboBox(this.#months);

        this.reloadButton = this.shadowRoot.querySelector('#reload');
        this.clearButton = this.shadowRoot.querySelector('#clear');

        this.tools = this.shadowRoot.querySelectorAll('.tool');
        this.pencil = this.shadowRoot.querySelector('pencil-tool');
        this.brush = this.shadowRoot.querySelector('brush-tool');


        this.registerChildComponents([this.brush, this.pencil]);
        
      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}


  getMonth() {
    return this.monthCombobox.value.toLowerCase();
  }

  setMonth(month) {
    this.monthCombobox.value = month;
  }

  initializeComboBox(list) {
    for (let i = 0; i < list.length; i++) {
      this.monthCombobox.appendChild(this.#generateOption(list[i]));
    }

    console.log('initializing combobox');
    console.log(list);

    this.setMonth(this.current_month);
  }

  #generateOption(option_string) {
    let option = document.createElement('option');
    option.setAttribute('value', option_string);
    option.append(option_string.capitalize());
    return option;
  }

  setToolSelection(toolType = '') {
    for (const tool of this.tools) {
      if(!tool.classList.contains(toolType.name))
        tool.uncheck();
    }
  }

  isToolSelected() { 
    let isToolSelected = false;
    for (const tool of this.tools) {
      if(tool.isChecked())
        isToolSelected = true;
    }
    return isToolSelected;
  }

}

if ('customElements' in window) {
  customElements.define('tool-bar', Toolbar);
}