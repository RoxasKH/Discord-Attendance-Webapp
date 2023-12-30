export class DialogButtonData {
  
  constructor(name, onClickFunction, highlighted = false) {
    this.name = name;
    this.onClickFunction = onClickFunction;
    this.highlighted = highlighted;
  }

}