import { config } from '../../utils/Config.js'

export class SignalComponent extends HTMLElement {

  constructor() {
    super();

    this.TEMPLATES_PATH = '../../templates/';

    this.childrenPromises = [];
  }

  registerChildComponents(components = []) {
    components.forEach(component => {
      let promise = new Promise((resolve) => {
        component.addEventListener('component-initialized', () => {
          resolve(this.constructor.name + ': ' + component.constructor.name + ' initialized');
        });
      });

      this.childrenPromises.push(promise);
    });

    Promise.all(this.childrenPromises)
      .then((results) => {
        // All events have been fired, and their promises have resolved
        results.forEach(result => { console.log(result); });
        console.log(this.constructor.name + ' - initialized');
        const initEvent = new Event('component-initialized', { bubbles: true });
        this.dispatchEvent(initEvent);
      });
  }
  
}