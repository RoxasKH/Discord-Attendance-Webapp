export class Observable {

    #state = null;
    #observers = [];

    getState() {
        return this.#state;
    }
  
    setState(newState) {
        this.#state = newState;
        this.notifyObservers();
    }
  
    addObserver(observer) {
         this.#observers.push(observer);
    }
  
    removeObserver(observer) {
        this.#observers = this.#observers.filter(obs => obs !== observer);
    }
  
    notifyObservers() {
        this.#observers.forEach(observer => {
            observer.update(this.#state);
        });
    }
    
}