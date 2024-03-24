import { Observable } from "../model/Observable.js";
import { Singleton } from "../model/Singleton.js";

export class Store extends Singleton {

    attendanceTableState = new Observable();

    userinfoState = new Observable();
    
    toolbarState = new Observable();
    brushState = new Observable();
    pencilState = new Observable();
    
    messageState = new Observable();
    dialogState = new Observable();
    
}