import { Observable } from "../../model/Observable.js";
import { NavigationBarState } from "../state/NavigationBarState.js";

export class NavigationBarHandler extends Observable {

    constructor() {
        super(new NavigationBarState());
    }

}