import { SignalComponent } from './SignalComponent.js'
import './Loader.js'
import { MessageTypeEnum } from '../../utils/enums/MessageTypeEnum.js'
import { getColor, getValue } from '../../utils/Colors.js'
import { debounce, index, rgba2hex, arraysEqual } from '../../utils/Utils.js'
import { UserAttendanceRepository } from '../../repository/UserAttendanceRepository.js'
import { UserAttendanceRepositoryError } from '../../repository/UserAttendanceRepositoryError.js'
import { ListenerHandlerSingleton } from '../../utils/ListenerHandlerSingleton.js'

class AttendanceTable extends SignalComponent {

  #table = null;
  #rows = [];
  #loader = null;
  #userAttendanceRepository = new UserAttendanceRepository();

  cells = [];
  listenerHandler = ListenerHandlerSingleton.getInstance();

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'components/attendance-table.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;

        this.#table = this.shadowRoot.querySelector('#attendance-table');
        this.#loader = this.shadowRoot.querySelector('loader-component');

        this.registerChildComponents([this.#loader]);

      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}


  update(id, month, message, currentArray) {

    message.close();

    this.#table.replaceChildren();
    this.#loader.show();

    this.#userAttendanceRepository.getAttendanceData(id)
      .then(response => {
        this.#loader.hide();

        console.log(response);

        for (const user of response) {
          console.log(user.discord_user_name)
        }

        let userElementArray = response.filter(element => element.discord_user_id == id);
        let otherUsersArray = response.filter(element => !userElementArray.includes(element));
        let orderedArray = userElementArray.concat(otherUsersArray);
        
        console.log(orderedArray);

        this.initialize(orderedArray, month);

        currentArray.update();
      })
      .catch(error => {

        if (error instanceof UserAttendanceRepositoryError) {
          this.#loader.hide();

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
  }

  initialize(response, month) {

    let days_headers = document.createElement('tr');
    days_headers.id = 'days-headers';
    days_headers.append(document.createElement('th')); 

    let days_number = response[0].attendance[month].length;

    for (let i = 0; i < days_number; i++) {

      let day_number = document.createElement('th');
      day_number.setAttribute('scope', 'col');
      day_number.append((i+1).toLocaleString('en-US', {minimumIntegerDigits: 2, useGrouping:false}));

      days_headers.append(day_number);
    }

    this.#table.append(days_headers);

    let entry;

    for (const user of response) {

      entry = document.createElement('tr');
      entry.id = user.discord_user_id;

      let entry_header = document.createElement('th');
      entry_header.setAttribute('scope', 'row');
      entry_header.append(user.discord_user_name);

      entry.append(entry_header);

      for (const value of user.attendance[month]) {
        let entry_cell = document.createElement('td');
        entry_cell.style.backgroundColor = getColor(value);
        entry.append(entry_cell);
      }

      this.#table.append(entry);

    }

    this.#rows = this.shadowRoot.querySelectorAll('tr');
    this.cells = this.shadowRoot.querySelectorAll('td');

    this.setCellsWidth(days_number);

    window.addEventListener('resize', debounce(() => {
      this.setCellsWidth(days_number);
    }, 100));


    this.initializeEventHandlers();

  }

  setCellColor(rowIndex, cellIndex, color) {
    for (const [index, row] of this.#rows.entries()) {
      if(index == rowIndex) {
        let rowCells = row.querySelectorAll('td');
        for (const [index, cell] of rowCells.entries()) {
          if(index == cellIndex) {
            cell.style.backgroundColor = color;
          }
        }
      }
    }
  }

  getCellColor(rowIndex, cellIndex) {
    let color;

    for (const [index, row] of this.#rows.entries()) {
      if(index == rowIndex) {
        let rowCells = row.querySelectorAll('td');
        for (const [index, cell] of rowCells.entries()) {
          if(index == cellIndex) {
            color = rgba2hex(cell.style.backgroundColor);
          }
        }
      }
    }

    return color;
  }

  setCellsWidth(days_number) {
    // Change td width dinamically based on the container width

    let container_width = this.shadowRoot.querySelector('.container').offsetWidth;
    let h_headers_width = this.#table.querySelector('th').offsetWidth;
    let all_td_width = container_width - h_headers_width;

    let single_td_width = parseInt(all_td_width/days_number) + 'px';

    console.log('C'+container_width);
    console.log('H'+h_headers_width);
    console.log('ALL'+all_td_width);
    console.log('S'+single_td_width);
    console.log(this.cells);

    for (const cell of this.cells) {
      cell.style.width = single_td_width;
    }

  }

  initializeEventHandlers() {

    this.#resetSelection();

    for (const cell of this.cells) {
      this.listenerHandler.removeAllListeners(cell, 'click');
      this.listenerHandler.removeAllListeners(cell, 'mousedown');
    }

    for (const cell of this.cells) {
      this.listenerHandler.addListener(cell, 'click', () => {
        this.#resetSelection();
        cell.style.filter = 'brightness(140%)';
      });
    }

  }

  #resetSelection() {
    for (const cell of this.cells) {
      cell.style.filter = 'none';
    }
  }

  recolorTableRow(attendanceArray, rowId, message) {

    for (const row of this.#rows) {
      if(row.id == rowId) {
        let rowCells = row.querySelectorAll('td');
        for (const [index, cell] of rowCells.entries()) {
          let color = getColor(attendanceArray[index]);
          cell.style.backgroundColor = color;
        }
      }
    }

    if(message.isOfType(MessageTypeEnum.WARNING) && message.getMessage() == 'Warning: unsaved changes') {
      message.close();
    }

  }

  getDaysNumber() {
    return this.#rows[1].querySelectorAll('td').length;
  }

  setEditMode(toolbar, id) {
    if (toolbar.isToolSelected()) {
      const [headers_row, ...rows] = this.#rows;

      for (const row of rows) {
        console.log('ID: '+id+', rowID:'+row.id);
        if (row.id != id) {
          row.disabled = true;
          row.style.filter = 'brightness(70%)';
          for (const cell of row.querySelectorAll('td')) {
            this.listenerHandler.removeAllListeners(cell, 'click');
          }
        }
      }
    }
    else {
      for (const row of this.#rows) {
        row.disabled = false;
        row.style.filter = 'none';
      }
    }
  }

  generateArray(row_index, cell_index, value) {
    let attendanceArray = [];

    for (const cell of this.shadowRoot.querySelectorAll('tr:nth-child(' + (row_index+1) + ') td')) {
      let hex_color = rgba2hex(cell.style.backgroundColor);
      attendanceArray.push(getValue(hex_color));
    }

    attendanceArray[cell_index] = parseInt(value);
    console.log(attendanceArray);

    return attendanceArray;
  }

  setPencilEventListener(data, month, pencil, currentArray, message) {

    for (const cell of this.cells) {
      if(!cell.parentNode.disabled) {
        this.listenerHandler.addListener(cell, 'click', (event) => {
          let row = cell.closest('tr');
          let rowCells = row.querySelectorAll('td');
          let rowIndex = index(this.#rows, row);
          let columnIndex = index(rowCells, cell);

          console.log("Row index: " + rowIndex + " | Column index: " + columnIndex);
          pencil.showOptions(event.clientX, event.clientY);
          pencil.setColorsEventListener(data, month, this, rowIndex, columnIndex, currentArray, message);
        });
      }
      else {
        this.listenerHandler.addListener(cell, 'click', () => { pencil.hideOptions(); });
      }
    }

  }

  setBrushEventListener(id, brush, currentArray, message) {

    for (const cell of this.cells) {
      if(!cell.parentNode.disabled) {
        this.listenerHandler.addListener(cell, 'mousedown', () => {
          let row = cell.closest('tr');
          let rowCells = row.querySelectorAll('td');
          let rowIndex = index(this.#rows, row);
          let columnIndex = index(rowCells, cell);

          console.log("Row index: " + rowIndex + " | Column index: " + columnIndex);
          
          let color = brush.getSelectedColor();
          this.setCellColor(rowIndex, columnIndex, color);

          console.log(currentArray.array);
          console.log(currentArray.get(id));

          if(!arraysEqual(currentArray.get(id), currentArray.array))
            message.show('Warning: unsaved changes', MessageTypeEnum.WARNING);
          else
            message.close();
        });
      }
    }

    this.listenerHandler.addListener(document, 'mousedown', () => {
      for (const cell of this.cells) {
        if(!cell.parentNode.disabled) {
          this.listenerHandler.addListener(cell, 'mouseover', () => {
            let color = brush.getSelectedColor();
            cell.style.backgroundColor = color;

            if(!arraysEqual(currentArray.get(id), currentArray.array))
              message.show('Warning: unsaved changes', MessageTypeEnum.WARNING);
            else
              message.close();
          });
        }
      }

    })

    this.listenerHandler.addListener(document, 'mouseup', () => {
      for (const cell of this.cells) {
        if(!cell.parentNode.disabled) {
          this.listenerHandler.removeAllListeners(cell, 'mouseover');
        }
      }
    });

  }

}

if ('customElements' in window) {
  customElements.define('attendance-table', AttendanceTable);
}