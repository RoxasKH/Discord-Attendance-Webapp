import { Observable } from "../../model/Observable.js";
import { DialogState } from "../state/DialogState.js";

export class DialogHandler extends Observable {

    constructor() {
        super(new DialogState());
    }

    show() {
        this.setState(state => ({
            ...state,
            show: true,
        }));
    }

    hide() {
        this.setState(state => ({
            ...state,
            show: false,
        }));
    }

    setMessage(message) {
        this.setState(state => ({
            ...state,
            message: message,
        }));
    }

    setButtons(buttonsList) {
        this.setState(state => ({
            ...state,
            buttonsList: buttonsList,
        }));
    }

    setLoading(loading) {
        this.setState(state => ({
            ...state,
            loading: loading,
        }));
    }

    setMandatory(mandatory) {
        this.setState(state => ({
            ...state,
            mandatory: mandatory,
        }));
    }

    setCancelFunction(cancelFunction) {
        this.setState(state => ({
            ...state,
            cancelFunction: cancelFunction,
        }));
    }

    clearCancelFunction() {
        this.setState(state => ({
            ...state,
            cancelFunction: () => {},
        }));
    }

}