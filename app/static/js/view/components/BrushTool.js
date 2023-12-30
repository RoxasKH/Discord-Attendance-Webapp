import '../components/Loader.js'
import { Tool } from '../components/Tool.js'
import { getColor } from '../../utils/Colors.js'

class BrushTool extends Tool {

  button = null;
  options = null;
  saveButton = null;
  loader = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'components/brush-tool.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;

        this.button = this.shadowRoot.querySelector('#brush');
        this.options = this.shadowRoot.querySelector('#options');
        this.saveButton = this.shadowRoot.querySelector('#save');

        this.loader = this.shadowRoot.querySelector('loader-component');

        this.registerChildComponents([this.loader]);

      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}


  toggleOptions() {
    this.options.classList.toggle('shrink');
    this.options.classList.toggle('enlarge');
  }

  hideOptions() {
    this.options.classList.add('shrink');
    this.options.classList.remove('enlarge');
  }

  initializeColors() {

    this.resetColorsBackground();

    this.options.querySelectorAll('label').forEach(label => {

      let labelInput = label.querySelector('input');
      let labelSpan = label.querySelector('span');

      labelInput.checked = false;

      let color = getColor(labelInput.value);

      labelSpan.style.borderColor = color;

      labelInput.addEventListener('change', () => {
        this.resetColorsBackground();
        labelSpan.style.backgroundColor = color;
      });

      if(color == getColor(0)) {
        labelInput.checked = true;
        labelSpan.style.backgroundColor = color;
      }

    });
  }

  resetColorsBackground() {
    this.options.querySelectorAll('span').forEach(colorOption => {
      colorOption.style.backgroundColor = 'transparent';
    });
  }

  getSelectedColor() {
    let value;
    this.options.querySelectorAll('input').forEach(color => {
      if(color.checked)
        value = color.value;
    });
    return getColor(value);
  }

}

if ('customElements' in window) {
  customElements.define('brush-tool', BrushTool);
}