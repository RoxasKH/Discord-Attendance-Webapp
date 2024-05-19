import { SignalComponent } from '../components/SignalComponent.js';
import '../components/Message.js';
import '../components/NavigationBar.js';
import '../components/Toolbar.js';
import '../components/AttendanceTable.js';
import '../components/Dialog.js';
import '../components/CustomCursor.js';
import { LocalStorageHelper } from '../../utils/LocalStorageHelper.js';
import { MessageTypeEnum } from '../../utils/enums/MessageTypeEnum.js';
import { ListenerHandlerSingleton } from '../../utils/ListenerHandlerSingleton.js';
import { User } from '../../model/User.js';
import { findRoots } from '../../utils/Utils.js';
import { UserAttendanceRepositoryError } from '../../repository/UserAttendanceRepositoryError.js';

export class Profile extends SignalComponent {

  #user = null;

  message = null;
  navbar = null;
  toolbar = null;
  table = null;
  dialog = null;
  customCursor = null;
  pencil = null;

  #userinfoState = null;
  #messageState = null;
  #pencilState = null;
  #attendanceTableState = null;

  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    const store = this.getStore();
    this.#userinfoState = store.userinfoState;
    this.#messageState = store.messageState;
    this.#pencilState = store.pencilState;
    this.#attendanceTableState = store.attendanceTableState;

    this.localStorageHelper = new LocalStorageHelper();
    this.listenerHandler = ListenerHandlerSingleton.getInstance();
  }

  async connectedCallback() {
    try {
      const htmlPath = this.TEMPLATES_PATH + 'pages/profile.html';
      const response = await fetch(htmlPath);
      const html = await response.text();
      this.shadowRoot.innerHTML = html;
  
      this.message = this.shadowRoot.querySelector('message-component');
      this.navbar = this.shadowRoot.querySelector('navigation-bar');
      this.toolbar = this.shadowRoot.querySelector('tool-bar');
      this.table = this.shadowRoot.querySelector('attendance-table');
      this.dialog = this.shadowRoot.querySelector('dialog-component');
      this.customCursor = this.shadowRoot.querySelector('custom-cursor');

      console.log(this.message);
      console.log(this.navbar);
      console.log(this.toolbar);
      console.log(this.table);
      console.log(this.dialog);
      console.log(this.customCursor);
  
      await this.registerChildComponents([
        this.message,
        this.navbar,
        this.toolbar,
        this.table,
        this.dialog,
        this.customCursor
      ]);
  
      this.#init();
    } catch (error) {
      console.error('Error loading HTML file:', error);
      throw error;
    }
  }

  async #init() {

    const { localStorageHelper } = this;

    this.#resetDocumentListeners();

    // where 'logged_in' is a flag variable saved in local storage that says if the user logged in before
    if (!localStorageHelper.exists('logged_in')) {
      this.#messageState.setMessage("User logged in successfully: Welcome, " + this.#user.username);
      this.#messageState.setType(MessageTypeEnum.SUCCESS);
      this.#messageState.show();
      localStorageHelper.setBoolean('logged_in', true);
    }

    this.#userinfoState.setUser(this.#user);

    const id = this.#userinfoState.getState().user.id;
    
    try {
      await this.#attendanceTableState.refresh(id);
    } catch (error) {
      if (error instanceof UserAttendanceRepositoryError) {
        this.#messageState.showUserAttendanceRepositoryError(
          error.status,
          error.description,
          error.error
        );

      } else {
        throw error;
      }
    }
    

    // Explicitly set cursor to auto for elements that are on a higher layer than the base one
    // This is needed for a better custom cursors behaviour

    const allElements = [ document.body, ...findRoots(document.body) ];

    let floatingElements = [];

    for (const element of allElements) {
      floatingElements.push(Array.prototype.slice.call(element.querySelectorAll('*')));
    }

    floatingElements = floatingElements.flat().filter(element => {
      let position = window.getComputedStyle(element).getPropertyValue('position');
      let zIndex = parseInt(window.getComputedStyle(element).getPropertyValue('z-index'));
      return position == 'absolute' || position == 'fixed' || zIndex >= 1;
    });

    console.log(floatingElements);
    
    for (const floatingElement of floatingElements) {
      floatingElement.style.cursor = 'auto';
    }

  }

  #resetDocumentListeners() {
    const { listenerHandler } = this;
		console.log('Resetting document listeners...')
		listenerHandler.removeAllListeners(document, 'click');
		listenerHandler.removeAllListeners(document, 'pointerdown');
		listenerHandler.removeAllListeners(document, 'pointerup');
		this.#initializeDocumentListeners();
	}

  #initializeDocumentListeners() {

    const {
      listenerHandler, 
      navbar,
      table, 
      toolbar,
    } = this;

		listenerHandler.addListener(document, 'click', (event) => {
			let userContainer = navbar.user;

			// If the target of the click isn't the container nor a descendant of the container
			// Thanking lamplight: https://lamplightdev.com/blog/2021/04/10/how-to-detect-clicks-outside-of-a-web-component/
			if (!event.composedPath().includes(userContainer)) {
        this.#userinfoState.hide();
			}

      
			let cells = table.cells;
			let pencilColors = toolbar.pencil.options;

			// If the target of the click isn't the container nor a descendant of the container
			if (!event.composedPath().includes(pencilColors)) {
				let isNotCell = true;
				for (const cell of cells) {
					if(event.composedPath().includes(cell)) {
						isNotCell = false;
					}
				}
				if(isNotCell) {
          this.#pencilState.hideOptions();
				}
			}

		});

	}

  set data(data) {
    this.#user = new User(data);
  }
  get data() {
    return this.#user;
  }

}

if ('customElements' in window) {
  customElements.define('profile-page', Profile);
}