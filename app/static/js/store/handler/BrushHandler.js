import { Observable } from "../../model/Observable.js";
import { BrushState } from "../state/BrushState.js";

export class BrushHandler extends Observable {

    constructor() {
        super(new BrushState());
    }

    selectColor(colorCode) {
        this.setState(state => ({
            ...state,
            selectedColor: colorCode,
        }));
    }

    setLoading(loading) {
        this.setState(state => ({
            ...state,
            loading: loading,
        }));
    }

}