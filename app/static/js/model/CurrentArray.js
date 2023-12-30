import { rgba2hex } from '../utils/Utils.js'
import { getValue } from '../utils/Colors.js'

export class CurrentArray {
  
  constructor(id, table) {
    this.id = id;
    this.table = table;
    this.array = this.get(this.id);
  }

  update() {
    this.array = this.get(this.id);
  }

  get(row_id) {
    const cells = this.table.shadowRoot.querySelectorAll('td');
    console.log(cells);
    let array = [];

    cells.forEach(function(cell, index) {
      if(cell.parentNode.id == row_id) {
        let color = rgba2hex(cell.style.backgroundColor);
        array.push(getValue(color));
      }
    });

    return array;
  }

}