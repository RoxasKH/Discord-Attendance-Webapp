export class MessageTypeEnum {

  static SUCCESS = new MessageTypeEnum('success');
  static ERROR = new MessageTypeEnum('error');
  static WARNING = new MessageTypeEnum('warning');

  constructor(name) {
    this.name = name;
  }

}