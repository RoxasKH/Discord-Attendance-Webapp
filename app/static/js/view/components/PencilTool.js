import './Loader.js';
import { Tool } from './Tool.js';
import { getValue, getColor } from '../../utils/Colors.js';
import { UserAttendanceRepository } from '../../repository/UserAttendanceRepository.js';
import { UserAttendanceRepositoryError } from '../../repository/UserAttendanceRepositoryError.js';
import { ListenerHandlerSingleton } from '../../utils/ListenerHandlerSingleton.js';
import { ToolTypeEnum } from '../../utils/enums/ToolTypeEnum.js';

class PencilTool extends Tool {

  #toolbarState = null;
  #pencilState = null;
  #userinfoState = null;
  #messageState = null;
  #attendanceTableState = null;

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

    const store = this.getStore();
    this.#toolbarState = store.toolbarState;
    this.#pencilState = store.pencilState;
    this.#userinfoState = store.userinfoState;
    this.#messageState = store.messageState;
    this.#attendanceTableState = store.attendanceTableState;
    this.#toolbarState.addObserver(this);
    this.#pencilState.addObserver(this);
  }

  async connectedCallback() {
    try {
      const htmlPath = this.TEMPLATES_PATH + 'components/pencil-tool.html';

      const response = await fetch(htmlPath);
      const html = await response.text();
      this.shadowRoot.innerHTML = html;

      this.button = this.shadowRoot.querySelector('#pencil');
      this.options = this.shadowRoot.querySelector('#options');
      this.optionsArrow = this.shadowRoot.querySelector('#options-arrow');
      this.#colorOptions = this.shadowRoot.querySelectorAll('.pencil-color');
      this.#colorsContainer = this.shadowRoot.querySelector('#colors-container');
      this.#loader = this.shadowRoot.querySelector('loader-component');

      await this.registerChildComponents([this.#loader]);

      this.#init();

    } catch (error) {
      console.error('Error loading HTML file:', error);
    }

  }

  #init() {
    this.initializeColors();
		this.button.addEventListener('click', () => {
			this.setPencil();
		});
  }

  update() {
    const {selected, tool, month} = this.#toolbarState.getState();
    const {user} = this.#userinfoState.getState();
    const {usersAttendance} = this.#attendanceTableState.getState();
    const {showOptions, loading, optionsPosition, targetCellIndex} = this.#pencilState.getState();
    const {x, y} = optionsPosition;

    selected && tool === ToolTypeEnum.PENCIL ? this.check() : this.uncheck();

    if (selected) {
      this.setColorsEventListener(user.id, month, usersAttendance, targetCellIndex)
    }

    if(!loading) {
      showOptions ? this.showOptions(x, y) : this.hideOptions();
    }

    loading ? this.#loader.show() : this.#loader.hide();
  }

  setPencil() {
    if (!this.isChecked()) {
      this.#toolbarState.setTool(ToolTypeEnum.PENCIL);
      this.#toolbarState.setSelection(true);
    } else {
      this.#toolbarState.setSelection(false);
    }
  }

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

  showOptions(eventX, eventY) {

    let popup = this.options;
    let container = document.body;
    let arrow = this.optionsArrow;

    let absX = eventX + window.scrollX;
    let absY = eventY + window.scrollY;

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

    popup.classList.remove('hide');
    arrow.classList.remove('hide');

  }

  setColorsEventListener(id, month, usersAttendance, cellIndex) {

    for (const colorOption of this.#colorOptions) {
      // Remove listeners previously set to other cells
      this.listenerHandler.removeAllListeners(colorOption, 'click');

      let color = getColor(colorOption.dataset.value);
      this.listenerHandler.addListener(colorOption, 'click', async () => {
        try {
          this.#pencilState.setLoading(true);
          this.#colorsContainer.style.filter = 'brightness(50%)';

          const currentValue = usersAttendance.find(entry => entry.discord_user_id == id).attendance[month][cellIndex];
          const newValue = getValue(color);

          if (currentValue != newValue) {
            const newAttendance = usersAttendance;
            newAttendance.find(entry => entry.discord_user_id == id).attendance[month][cellIndex] = newValue;

            await this.#userAttendanceRepository.updateDatabaseEntry(
              id, 
              month, 
              newAttendance.find(entry => entry.discord_user_id == id).attendance[month]
            );

            this.#attendanceTableState.setAttendance(newAttendance);
          }

          this.#pencilState.setLoading(false);
          this.#colorsContainer.style.filter = 'none';

          this.#pencilState.hideOptions();
        
        } catch (error) {
          if (error instanceof UserAttendanceRepositoryError) {
            this.#messageState.showUserAttendanceRepositoryError(
              error.status,
              error.description,
              error.error
            );
          }
          else {
            throw error;
          }
        }

      });
    }
  }

}

if ('customElements' in window) {
  customElements.define('pencil-tool', PencilTool);
}