import { deepCopy, deepEqual } from "../utils/Utils.js";

export class Observable {

    #state = null;
    #observers = [];

    constructor(initialState) {
        this.setState(initialState);
    }

    getState() {
        return deepCopy(this.#state);
    }
  
    setState(newState) {
        if (typeof newState === 'function') {
            newState = newState(deepCopy(this.#state));
        }

        if (typeof newState !== typeof this.#state) {
            throw new TypeError(`Type mismatch: Expected ${typeof this.#state}, received ${typeof newState}`);
        }

        if(!deepEqual(this.#state, newState)) {
            if(this.#state && this.#state.editableAttendance) console.log("I'M IN");
            this.#state = newState;
            this.notifyObservers();
        }

    }
  
    addObserver(observer) {
         this.#observers.push(observer);
    }
  
    removeObserver(observer) {
        this.#observers = this.#observers.filter(obs => obs !== observer);
    }
  
    notifyObservers() {
        for (const observer of this.#observers) {
            observer.update(deepCopy(this.#state));
        }
    }
    
}