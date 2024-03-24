import { MessageTypeEnum } from "../../utils/enums/MessageTypeEnum.js";

export class MessageState {

    show = false;
    type = MessageTypeEnum.SUCCESS;
    message = '';

    constructor(
        show,
        type,
        message,
    ) {
        this.show = show;
        this.type = type;
        this.message = message;
    }

}