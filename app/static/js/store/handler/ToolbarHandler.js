import { Observable } from "../../model/Observable.js";
import { ToolbarState } from "../state/ToolbarState.js";

export class ToolbarHandler extends Observable {

    constructor() {
        super(new ToolbarState());
    }

    setMonth(month) {
        this.setState(state => ({
            ...state,
            month: month,
        }));
    }

    setSelection(selected) {
        this.setState(state => ({
            ...state,
            selected: selected,
        }));
    }

    setTool(tool) {
        this.setState(state => ({
            ...state,
            tool: tool,
        }));
    }

    setMonth(month) {
        this.setState(state => ({
            ...state,
            month: month,
        }));
    }

}