import './Loader.js';
import { Tool } from './Tool.js';
import { getColor } from '../../utils/Colors.js';
import { ToolTypeEnum } from '../../utils/enums/ToolTypeEnum.js';
import { deepEqual } from '../../utils/Utils.js';
import { UserAttendanceRepository } from '../../repository/UserAttendanceRepository.js';
import { UserAttendanceRepositoryError } from '../../repository/UserAttendanceRepositoryError.js';
import { DialogButtonData } from '../../model/DialogButtonData.js';

class BrushTool extends Tool {

  userAttendanceRepository = new UserAttendanceRepository();
  
  #toolbarState = null;
  #brushState = null;
  #userinfoState = null;
  #messageState = null;
  #attendanceTableState = null;
  #dialogState = null;

  button = null;
  options = null;
  saveButton = null;
  loader = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const store = this.getStore();
    this.#toolbarState = store.toolbarState;
    this.#brushState = store.brushState;
    this.#userinfoState = store.userinfoState;
    this.#messageState = store.messageState;
    this.#dialogState = store.dialogState;
    this.#attendanceTableState = store.attendanceTableState;
    this.#toolbarState.addObserver(this);
    this.#brushState.addObserver(this);
  }

  async connectedCallback() {
    try {
      const htmlPath = this.TEMPLATES_PATH + 'components/brush-tool.html';

      const response = await fetch(htmlPath);
      const html = await response.text();
      this.shadowRoot.innerHTML = html;

      this.button = this.shadowRoot.querySelector('#brush');
      this.options = this.shadowRoot.querySelector('#options');
      this.saveButton = this.shadowRoot.querySelector('#save');

      this.loader = this.shadowRoot.querySelector('loader-component');

      await this.registerChildComponents([this.loader]);

      this.#init();
    }
    catch(error) {
      console.error('Error loading HTML file:', error);
    }
  }

  #init() {
    this.initializeColors();
		this.button.addEventListener('click', () => {
			this.setBrush();
		});
		this.saveButton.addEventListener('click', async () => {
			await this.#save();
		});
  }


  update() {

    const {selected, tool} = this.#toolbarState.getState();
    const {selectedColor, loading} = this.#brushState.getState();
    const {usersAttendance, editableAttendance} = this.#attendanceTableState.getState();

    if (selected && tool === ToolTypeEnum.BRUSH) {
      this.check();
      this.showOptions();
    } else {
      this.uncheck();
      this.hideOptions();

      if(!deepEqual(usersAttendance, editableAttendance)) {
        let discardButton = new DialogButtonData(
          'Discard', 
          () => {
            this.#attendanceTableState.resetEdits();
          }
        );
        let saveButton = new DialogButtonData(
          'Save', 
          async () => {
            this.#dialogState.setLoading(true);
            await this.#save();
            this.#dialogState.setLoading(false);
          }, 
          true
        );
        this.#dialogState.setCancelFunction(() => { this.#toolbarState.setSelection(true); });
        this.#dialogState.setMessage('Warning: you are leaving brush mode with unsaved changes. Do you want to save them?');
        this.#dialogState.setButtons([discardButton, saveButton]);
        this.#dialogState.setMandatory(true);
        this.#dialogState.show();
      }

    }

    if (selectedColor !== this.getSelectedColor) {
      this.setBrushColor(selectedColor);
    }

    loading ? this.loader.show() : this.loader.hide();

  }

  setBrush() {
    if (!this.isChecked()) {
      this.#toolbarState.setTool(ToolTypeEnum.BRUSH);
      this.#toolbarState.setSelection(true);
    } else {
      this.#toolbarState.setSelection(false);
    }
  }

  showOptions() {
    this.options.classList.remove('shrink');
    this.options.classList.add('enlarge');
  }

  hideOptions() {
    this.options.classList.add('shrink');
    this.options.classList.remove('enlarge');
  }

  getSelectedColor() {
    let value;
    for (const color of this.options.querySelectorAll('input')) {
      if(color.checked)
        value = color.value;
    }
    return getColor(value);
  }

  setBrushColor(selectedColor) {

    this.resetColorsBackground();

    for (const label of this.options.querySelectorAll('label')) {

      let labelInput = label.querySelector('input');
      let labelSpan = label.querySelector('span');

      labelInput.checked = false;

      let color = getColor(labelInput.value);

      if(color === selectedColor) {
        labelInput.checked = true;
        labelSpan.style.backgroundColor = color;
      }

    }
  }

  initializeColors() {

    this.resetColorsBackground();

    for (const label of this.options.querySelectorAll('label')) {

      let labelInput = label.querySelector('input');
      let labelSpan = label.querySelector('span');

      labelInput.checked = false;

      let color = getColor(labelInput.value);

      labelSpan.style.borderColor = color;

      labelInput.addEventListener('change', () => {
        this.#brushState.selectColor(color);
      });

    }

    const firstColor = getColor(this.options.querySelectorAll('label')[0].querySelector('input').value);
    this.#brushState.selectColor(firstColor);

  }

  resetColorsBackground() {
    for (const colorOption of this.options.querySelectorAll('span')) {
      colorOption.style.backgroundColor = 'transparent';
    }
  }

  async #save() {
    try {

      const {user} = this.#userinfoState.getState();
      const {month} = this.#toolbarState.getState();
      const {editableAttendance} = this.#attendanceTableState.getState();

      this.#brushState.setLoading(true);

      const response = await this.userAttendanceRepository.updateDatabaseEntry(
        user.id,
        month,
        editableAttendance.find(entry => entry.discord_user_id == user.id).attendance[month]
      );

      this.#attendanceTableState.saveEdits();

      this.#brushState.setLoading(false);

      console.log(response);

    } catch (error) {
      this.#brushState.setLoading(false);

      if (error instanceof UserAttendanceRepositoryError) {
        this.#messageState.showUserAttendanceRepositoryError(
          error.status,
          error.description,
          error.error
        );

      } else {
        throw error;
      }

    }

 }

}

if ('customElements' in window) {
  customElements.define('brush-tool', BrushTool);
}