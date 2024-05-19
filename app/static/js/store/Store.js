import { AttendanceTableHandler } from "./handler/AttendanceTableHandler.js";
import { BrushHandler } from "./handler/BrushHandler.js";
import { DialogHandler } from "./handler/DialogHandler.js";
import { MessageHandler } from "./handler/MessageHandler.js";
import { PencilHandler } from "./handler/PencilHandler.js";
import { ToolbarHandler } from "./handler/ToolbarHandler.js";
import { UserInfoHandler } from "./handler/UserInfoHandler.js";

export class Store {

    attendanceTableState = new AttendanceTableHandler();

    userinfoState = new UserInfoHandler();
    
    toolbarState = new ToolbarHandler();
    brushState = new BrushHandler();
    pencilState = new PencilHandler();
    
    messageState = new MessageHandler();
    dialogState = new DialogHandler();

    constructor() {
        if (Store.instance) {
            return Store.instance;
        }
        Store.instance = this;
    }
    
}