import { SignalComponent } from '../components/SignalComponent.js'
import '../components/Message.js'
import '../components/NavigationBar.js'
import '../components/Toolbar.js'
import '../components/AttendanceTable.js'
import '../components/Dialog.js'
import '../components/CustomCursor.js'

class Profile extends SignalComponent {

  message = null;
  navbar = null;
  toolbar = null;
  table = null;
  dialog = null;
  customCursor = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    const htmlPath = this.TEMPLATES_PATH + 'pages/profile.html';

    fetch(htmlPath)
      .then(response => response.text())
      .then(html => {
        this.shadowRoot.innerHTML = html;


        this.message = this.shadowRoot.querySelector('message-component');
        console.log(this.message);
        this.navbar = this.shadowRoot.querySelector('navigation-bar');
        this.toolbar = this.shadowRoot.querySelector('tool-bar');
        this.table = this.shadowRoot.querySelector('attendance-table');
        this.dialog = this.shadowRoot.querySelector('dialog-component');
        this.customCursor = this.shadowRoot.querySelector('custom-cursor');


        this.registerChildComponents([
          this.message,
          this.navbar,
          this.toolbar,
          this.table,
          this.dialog,
          this.customCursor
        ]);
        
      })
      .catch(error => console.error('Error loading HTML file:', error));
  }

  disconnectedCallback() {}

}

if ('customElements' in window) {
  customElements.define('profile-page', Profile);
}