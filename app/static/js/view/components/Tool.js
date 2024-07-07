import { SignalComponent } from './SignalComponent.js';

export class Tool extends SignalComponent {

  uncheck() {
    this.shadowRoot.querySelector('.tool-button').classList.remove('checked');
  }

  check() {
    this.shadowRoot.querySelector('.tool-button').classList.add('checked');
  }

  isChecked() {
    return this.shadowRoot.querySelector('.tool-button').classList.contains('checked');
  }

}