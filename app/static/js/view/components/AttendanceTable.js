import { SignalComponent } from './SignalComponent.js';
import './Loader.js';
import { MessageTypeEnum } from '../../utils/enums/MessageTypeEnum.js';
import { getColor, getValue } from '../../utils/Colors.js';
import { deepEqual } from '../../utils/Utils.js';
import { ListenerHandlerSingleton } from '../../utils/ListenerHandlerSingleton.js';
import { ToolTypeEnum } from '../../utils/enums/ToolTypeEnum.js';

class AttendanceTable extends SignalComponent {

  #attendanceTableState = null;
  #userinfoState = null;
  #toolBarState = null;
  #brushState = null;
  #pencilState = null;
  #messageState = null;

  #table = null;
  #rows = [];
  cells = [];
  #loader = null;
  
  #listenerHandler = ListenerHandlerSingleton.getInstance();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const store = this.getStore();
    this.#attendanceTableState = store.attendanceTableState;
    this.#userinfoState = store.userinfoState;
    this.#toolBarState = store.toolbarState;
    this.#brushState = store.brushState;
    this.#pencilState = store.pencilState;
    this.#messageState = store.messageState;
    this.#attendanceTableState.addObserver(this);
    this.#toolBarState.addObserver(this);
    this.#brushState.addObserver(this);
  }

  async connectedCallback() {
    try {
      const htmlPath = this.TEMPLATES_PATH + 'components/attendance-table.html';

      const response = await fetch(htmlPath);
      const html = await response.text();
      this.shadowRoot.innerHTML = html;

      this.#table = this.shadowRoot.querySelector('#attendance-table');
      this.#loader = this.shadowRoot.querySelector('loader-component');

      await this.registerChildComponents([this.#loader]);

      this.#init();
    }
    catch (error) {
      console.error('Error loading HTML file:', error);
    }
  }

  #init() {
    this.#attendanceTableState.setLoading(true);
  }

  update() {

    const {
      loading,
      users,
      usersAttendance,
      editableAttendance,
    } = this.#attendanceTableState.getState();

    const {selected: selectedTool, tool, month} = this.#toolBarState.getState();

    const {user} = this.#userinfoState.getState();

    const {selectedColor} = this.#brushState.getState();
    
    loading ? this.#loader.show() : this.#loader.hide();

    if (editableAttendance && editableAttendance.length) {

      let daysNumber = editableAttendance[0].attendance[month].length;
      this.#generateDaysHeaders(daysNumber);

      for (const user of editableAttendance) {
        this.#generateUserEntry(user, month);
      }

      this.#rows = this.shadowRoot.querySelectorAll('.row');
      this.cells = this.shadowRoot.querySelectorAll('.cell');

      this.#initializeEventHandlers();

      if (selectedTool) {
        this.#setEditMode(user.id)
        switch (tool) {
          case ToolTypeEnum.BRUSH:
            this.#setBrushEventListener(user.id, selectedColor, editableAttendance, month);
            break;
          case ToolTypeEnum.PENCIL:
            this.#setPencilEventListener();
            break;
        }
      } else {
        this.#exitEditMode();
      }

      if (!deepEqual(usersAttendance, editableAttendance)) {
        this.#messageState.setMessage("Warning: unsaved changes");
        this.#messageState.setType(MessageTypeEnum.WARNING);
        this.#messageState.show();
      } else {
        this.#messageState.hide();
      }

    }

  }

  #generateDaysHeaders(daysNumber) {

    let daysHeaders = this.#table.querySelector('#days-headers');

    if (!daysHeaders) {
      daysHeaders = document.createElement('div');
      daysHeaders.classList.add('row');
      daysHeaders.id = 'days-headers';

      const emptyHeader = document.createElement('div');
      emptyHeader.classList.add('empty-header');
      daysHeaders.append(emptyHeader); 

      this.#table.append(daysHeaders);
    }  

    let previousDaysNumber = daysHeaders.querySelectorAll('.header').length

    let count = Math.abs(daysNumber - previousDaysNumber);

    if (daysNumber > previousDaysNumber) {
      let i = previousDaysNumber;
      while (count--) {
        let day = document.createElement('div');
        day.classList.add('header');
        let dayNumber = (++i).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping: false});
        day.append(dayNumber);

        daysHeaders.append(day);
      }
    } else {
      while (count--) {
        daysHeaders.lastChild.remove();
      }
    }

  }

  #generateUserEntry(user, month) {

    // Using weird syntax cause querySelector isn't aligned with HTML5 and doesn't allow for numeric ids
    let userEntry = this.#table.querySelector(`[id='${user.discord_user_id}']`);
    let otherUsers = this.#table.querySelector('#other-users');

    if (!userEntry) {
      userEntry = document.createElement('div');
      userEntry.classList.add('row');
      userEntry.id = user.discord_user_id;

      if (!otherUsers) {
        this.#table.append(userEntry);
        otherUsers = document.createElement('div');
        otherUsers.id = 'other-users';
        this.#table.append(otherUsers); 
      } else {
        otherUsers.append(userEntry);
      }

      let entryHeader = document.createElement('div');
      entryHeader.classList.add('header');
      entryHeader.append(user.discord_user_name);
      userEntry.append(entryHeader);
    }

    let previousDaysNumber = userEntry.querySelectorAll('.cell').length;
    let daysNumber = user.attendance[month].length;

    let count = Math.abs(daysNumber - previousDaysNumber);

    if (daysNumber > previousDaysNumber) {
      while (count--) {
        let entryCell = document.createElement('div');
        entryCell.classList.add('cell');
        userEntry.append(entryCell);
      }
    } else {
      while (count--) {
        userEntry.lastChild.remove();
      }
    }

    let entryCells = userEntry.querySelectorAll('.cell');

    for (const [index, value] of user.attendance[month].entries()) {
      entryCells[index].setAttribute('value', value);
      entryCells[index].style.backgroundColor = getColor(value);
    }
    
  }

  #initializeEventHandlers() {

    this.#resetSelection();

    for (const cell of this.cells) {
      this.#listenerHandler.removeAllListeners(cell, 'click');
      this.#listenerHandler.removeAllListeners(cell, 'pointerdown');
    }

    this.#listenerHandler.removeAllListeners(this.#table, 'pointerdown');
    this.#listenerHandler.removeAllListeners(this.#table, 'pointerup');
    this.#listenerHandler.removeAllListeners(this.#table, 'pointermove');

    for (const cell of this.cells) {
      this.#listenerHandler.addListener(cell, 'click', () => {
        this.#resetSelection();
        cell.style.filter = 'brightness(140%)';
      });
    }

  }

  #resetSelection() {
    for (const cell of this.cells) {
      if (cell.style.filter !== 'none') {
        cell.style.filter = 'none';
      }
    }
  }

  #setEditMode(id) {
    const [headers_row, ...rows] = this.#rows;

    for (const row of rows) {
      console.log('ID: '+id+', rowID:'+row.id);
      if (row.id != id) {
        row.disabled = true;
        row.style.filter = 'brightness(70%)';
        for (const cell of row.querySelectorAll('.cell')) {
          this.#listenerHandler.removeAllListeners(cell, 'click');
        }
      }
    }
  
  }

  #exitEditMode() {
    for (const row of this.#rows) {
      row.disabled = false;
      row.style.filter = 'none';
    }
  }

  #setPencilEventListener() {

    for (const cell of this.cells) {
      if(!cell.parentNode.disabled) {
        this.#listenerHandler.addListener(cell, 'click', (event) => {
          let row = cell.closest('.row');
          let rowCells = row.querySelectorAll('.cell');
          let cellIndex = Array.from(rowCells).indexOf(cell);
          
          this.#pencilState.setOptionsPosition(event.clientX, event.clientY);
          this.#pencilState.setTargetCellIndex(cellIndex);
          
          this.#pencilState.showOptions();
        });
      }
      else {
        this.#listenerHandler.addListener(cell, 'click', () => { this.#pencilState.hideOptions(); });
      }
    }

  }

  #setBrushEventListener(id, selectedColor, usersAttendance, month) {

    const color = selectedColor;

    const newAttendance = usersAttendance;

    const brushCell = (cell) => {
      let row = cell.closest('.row');
      let rowCells = row.querySelectorAll('.cell');
      let cellIndex = Array.from(rowCells).indexOf(cell);

      newAttendance.find(entry => entry.discord_user_id === id).attendance[month][cellIndex] = getValue(color);
      cell.style.backgroundColor = color;
    }

    // Updating the UI manually and updating the state only on pointerup and 
    // pointerdown to avoid extreme lag due to too many subsequent table updates
    // Possible workarounds involve debouncing the pointermove event function

    this.#listenerHandler.addListener(this.#table, 'pointerdown', (event) => {
      if (event.target.classList.contains('cell') && !event.target.parentNode.disabled) {
        let cell = event.target;
        brushCell(cell);
        this.#attendanceTableState.setEditableAttendance(newAttendance);
      }
      
    });

    this.#listenerHandler.addListener(this.#table, 'pointermove', (event) => {
      // use the PointerEvent API to detect if mouse button/touch is currently pressed
      // 1 refers to the primary mouse button, usually left clic, or touch pressing
      if(event.buttons === 1) {
        if (event.target.classList.contains('cell') && !event.target.parentNode.disabled) {
          let cell = event.target;
          brushCell(cell);
        }
      }
    });

    this.#listenerHandler.addListener(this.#table, 'pointerup', () => {
      this.#attendanceTableState.setEditableAttendance(newAttendance);
    });

  }

}

if ('customElements' in window) {
  customElements.define('attendance-table', AttendanceTable);
}