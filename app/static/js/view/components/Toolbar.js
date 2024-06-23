import { SignalComponent } from './SignalComponent.js';
import './PencilTool.js';
import './BrushTool.js';
import './Select.js';
import '../../utils/Utils.js';
import { ToolTypeEnum } from '../../utils/enums/ToolTypeEnum.js';
import { DialogButtonData } from '../../model/DialogButtonData.js';
import { UserAttendanceRepositoryError } from '../../repository/UserAttendanceRepositoryError.js';
import { UserAttendanceRepository } from '../../repository/UserAttendanceRepository.js';

class Toolbar extends SignalComponent {

  #toolbarState = null;
  #attendanceTableState = null;
  #userinfoState = null;
  #dialogState = null;
  #messageState = null;

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

  #userAttendanceRepository = new UserAttendanceRepository();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const store = this.getStore();
    this.#toolbarState = store.toolbarState;
    this.#attendanceTableState = store.attendanceTableState;
    this.#userinfoState = store.userinfoState;
    this.#dialogState = store.dialogState;
    this.#messageState = store.messageState;
    this.#toolbarState.addObserver(this);

    const date = new Date();
    for(let month = 0; month < 12; ++month) {
       date.setMonth(month);
       this.#months.push(date.toLocaleString('en-US', {month: 'long'}).toLowerCase());
    }

    this.current_month = (new Date()).toLocaleString('en-US', {month: 'long'}).toLowerCase();
  }

  async connectedCallback() {
    try {
      const htmlPath = this.TEMPLATES_PATH + 'components/toolbar.html';
      const response = await fetch(htmlPath);
      const html = await response.text();
      this.shadowRoot.innerHTML = html;

      this.monthCombobox = this.shadowRoot.querySelector('select-component');

      this.reloadButton = this.shadowRoot.querySelector('#reload');
      this.clearButton = this.shadowRoot.querySelector('#clear');

      this.tools = this.shadowRoot.querySelectorAll('.tool');
      this.pencil = this.shadowRoot.querySelector('pencil-tool');
      this.brush = this.shadowRoot.querySelector('brush-tool');

      await this.registerChildComponents([this.brush, this.pencil, this.monthCombobox]);

      this.#init();
    }
    catch(error) {
      console.error('Error loading HTML file:', error);
    }

  }

  #init() {
    this.monthCombobox.init(
      'Month:',
      this.#months,
      this.current_month,
      (value) => {
        this.#toolbarState.setMonth(value);
      }
    );

    this.reloadButton.addEventListener('click', () => {
      const {user} = this.#userinfoState.getState();
      this.#attendanceTableState.refresh(user.id);
    });

    this.clearButton.addEventListener('click', () => {
			let clearButton = new DialogButtonData(
        'Clear',
        async () => {
          this.#dialogState.setLoading(true);
          await this.#clearAttendance();
          this.#dialogState.setLoading(false);
        },
        true
      );

      this.#dialogState.setMessage('Are you sure you wanna clear your attendance for this month? This change cannot be reverted back.');
      this.#dialogState.setButtons([clearButton]);
      this.#dialogState.show();

		});
  }

  update(state) {

    const {selected, tool, month} = state;

    if (selected) {
      switch (tool) {
        case ToolTypeEnum.PENCIL:
          this.pencil.check();
        case ToolTypeEnum.BRUSH:
          this.brush.check();
      }
    }
    else {
      this.setToolSelection();
    }

    //this.setMonth(month);

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
    option.addEventListener('click', () => {
      this.#toolbarState.setMonth(option_string);
    });
    return option;
  }

  setToolSelection(toolType = '') {
    for (const tool of this.tools) {
      if(!tool.classList.contains(toolType.name))
        tool.uncheck();
    }
  }

  async #clearAttendance() {
    try {

      const {month} = this.#toolbarState.getState();
      const {user} = this.#userinfoState.getState();
      const {usersAttendance} = this.#attendanceTableState.getState();

      const daysNumber = usersAttendance[3].attendance[month].length;

      let emptyArray = new Array(daysNumber).fill(0);

      const newAttendance = usersAttendance;
      newAttendance.find(entry => entry.discord_user_id == user.id).attendance[month] = emptyArray;

      await this.#userAttendanceRepository.updateDatabaseEntry(
        user.id, 
        month,
        emptyArray
      )

      this.#attendanceTableState.setAttendance(newAttendance);
      
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
	
	}

}

if ('customElements' in window) {
  customElements.define('tool-bar', Toolbar);
}