import { Store } from "../../store/Store.js";

export class SignalComponent extends HTMLElement {

  TEMPLATES_PATH = '../../templates/';
  childrenPromises = [];

  constructor() {
    super();
  }

  getStore() {
    return new Store();
  }

  async registerChildComponents(components = []) {
    for (const component of components) {
      let promise = new Promise((resolve) => {
        component.addEventListener('component-initialized', () => {
          resolve(this.constructor.name + ': ' + component.constructor.name + ' initialized');
        });
      });

      this.childrenPromises.push(promise);
    }

    return Promise.all(this.childrenPromises)
      .then((results) => {
        // All events have been fired, and their promises have resolved
        for (const result of results) { console.log(result); }
        console.log(this.constructor.name + ' - initialized');
        const initEvent = new Event('component-initialized', { bubbles: true });
        this.dispatchEvent(initEvent);
      });
  }
  
}