import { Observable } from "../../model/Observable.js";
import { PencilState } from "../state/PencilState.js";

export class PencilHandler extends Observable {

    constructor() {
        super(new PencilState());
    }

    setLoading(loading) {
        this.setState((state) => ({
            ...state,
            loading: loading,
        }));
    }

    showOptions() {
        this.setState((state) => ({
            ...state,
            showOptions: true,
        }));
    }

    hideOptions() {
        this.setState((state) => ({
            ...state,
            showOptions: false,
        }));
    }

    setOptionsPosition(x, y) {
        this.setState((state) => ({
            ...state,
            optionsPosition: {x, y},
        }));
    }

    setTargetCellIndex(index) {
        this.setState((state) => ({
            ...state,
            targetCellIndex: index,
        }));
    }

}