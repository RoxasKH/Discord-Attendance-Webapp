import './Loader.js'
import { Tool } from './Tool.js'
import { getValue, getColor } from '../../utils/Colors.js'
import { UserAttendanceRepository } from '../../repository/UserAttendanceRepository.js'
import { UserAttendanceRepositoryError } from '../../repository/UserAttendanceRepositoryError.js'
import { ListenerHandlerSingleton } from '../../utils/ListenerHandlerSingleton.js'

class PencilTool extends Tool {

  button = null;
  options = null;
  optionsArrow = null;
  listenerHandler = ListenerHandlerSingleton.getInstance();

  #colorOptions = null;
  #colorsContainer = null;
  #loader = null;
  #userAttendanceRepository = new UserAttendanceRepository();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'components/pencil-tool.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;

        this.button = this.shadowRoot.querySelector('#pencil');
        this.options = this.shadowRoot.querySelector('#options');
        this.optionsArrow = this.shadowRoot.querySelector('#options-arrow');
        this.#colorOptions = this.shadowRoot.querySelectorAll('.pencil-color');
        this.#colorsContainer = this.shadowRoot.querySelector('#colors-container');
        this.#loader = this.shadowRoot.querySelector('loader-component');

        this.registerChildComponents([this.#loader]);

      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}


  initializeColors() {
    for (const colorOption of this.#colorOptions) {
      let color = getColor(colorOption.dataset.value);
      colorOption.style.backgroundColor = color;
    }
  }

  hideOptions() {
    this.options.classList.add('hide');
    this.optionsArrow.classList.add('hide');
  }


  showOptions(clientX, clientY) {

    let popup = this.options;
    let container = document.body;
    let arrow = this.optionsArrow;

    popup.classList.remove('hide');
    arrow.classList.remove('hide');

    let absX = clientX + window.scrollX;
    let absY = clientY + window.scrollY;

    // Cause i'm using css translate -50% and box-sizing: border-box
    let maxX = container.offsetWidth - (popup.offsetWidth/2 + parseInt(getComputedStyle(popup).borderWidth.replace('px', '')));
    let maxY = container.offsetHeight - popup.offsetHeight;
    
    let x = Math.max(0, Math.min(absX, maxX));
    let y = Math.max(0, Math.min(absY, maxY));

    let arrowHeight = parseInt(getComputedStyle(arrow).borderTopWidth.replace('px', ''));

    popup.style.cssText = `
      left: ${x}px;
      top: ${y - arrowHeight}px;
    `;

    console.log('maxX calculation: container.width = ' + container.offsetWidth + ' / popup.width/2 = ' + popup.offsetWidth/2);
    console.log('popupborder = ' + getComputedStyle(popup).borderWidth.replace('px', '') + ' / arrowHeight = ' + arrowHeight);
    console.log('absX = ' + absX + ' / maxX = ' + maxX);
    console.log('X = ' + x + ' / Y = ' + (y - arrowHeight));

    arrow.style.cssText = `
      left: ${absX}px;
      top: ${y}px;
    `;

  }

  setColorsEventListener(data, month, table, row_index, cell_index, currentArray, message) {

    for (const colorOption of this.#colorOptions) {
      // Remove listeners previously set to other cells
      this.listenerHandler.removeAllListeners(colorOption, 'click');

      let color = getColor(colorOption.dataset.value);
      this.listenerHandler.addListener(colorOption, 'click', () => {
        this.#loader.show();
        this.#colorsContainer.style.filter = 'brightness(50%)';

        if (table.getCellColor(row_index, cell_index) != color) {
          table.setCellColor(row_index, cell_index, color);
          let array = table.generateArray(row_index, cell_index, getValue(color));
          this.#userAttendanceRepository.updateDatabaseEntry(data, month, array)
          .then(response => {
            this.#loader.hide();
            this.hideOptions();
            this.#colorsContainer.style.filter = 'none';
          })
          .catch(error => {

            if (error instanceof UserAttendanceRepositoryError) {
              message.show(
                `<div><b>Status:</b> &#10006; Error </div> <br>
                <div><b>Error Type:</b> ${error.status} - ${error.description}</div>
                <div><b>Description:</b> ${error.error}</div>`,
                MessageTypeEnum.ERROR
              );
            }
            else {
              throw error;
            }

          });

          currentArray.update();
        }
        else {
          this.hideOptions();
        }
      });
    }
  }

}

if ('customElements' in window) {
  customElements.define('pencil-tool', PencilTool);
}