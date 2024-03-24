import { DialogButtonData } from "../../model/DialogButtonData.js";

export class DialogState {

    show  = false;
    mandatory = false;
    buttonList = [new DialogButtonData()];
    message = '';
    cancelFunction = () => {};

    constructor(
        show,
        mandatory,
        buttonList,
        message,
        cancelFunction = () => {}
    ) {
        this.show = show;
        this.mandatory = mandatory;
        this.buttonList = buttonList;
        this.message = message;
        this.cancelFunction = cancelFunction;
    }

}