import { SignalComponent } from './SignalComponent.js';

export class Tool extends SignalComponent {

  uncheck() {
    this.shadowRoot.querySelector('input[type="checkbox"]').checked = false;
  }

  check() {
    this.shadowRoot.querySelector('input[type="checkbox"]').checked = true;
  }

  isChecked() {
    return this.shadowRoot.querySelector('input[type="checkbox"]').checked;
  }

}