export class ToolTypeEnum {

  static PENCIL = new ToolTypeEnum('pencil');
  static BRUSH = new ToolTypeEnum('brush');

  constructor(name) {
    this.name = name;
  }

}