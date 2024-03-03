import { MessageTypeEnum } from '../../utils/enums/MessageTypeEnum.js'
import { LocalStorageHelper } from '../../utils/LocalStorageHelper.js'
import { CurrentArray } from '../../model/CurrentArray.js';
import { ListenerHandlerSingleton } from '../../utils/ListenerHandlerSingleton.js'
import { DialogButtonData } from '../../model/DialogButtonData.js'
import { UserAttendanceRepository } from '../../repository/UserAttendanceRepository.js'
import { UserAttendanceRepositoryError } from '../../repository/UserAttendanceRepositoryError.js'
import { findRoots } from '../../utils/Utils.js'
import { User } from '../../model/User.js';
import { MessageController } from '../components/MessageController.js';
import { NavBarController } from '../components/NavBarController.js';
import { UserInfoController } from '../components/UserInfoController.js';
import { TableController } from '../components/TableController.js';
import { ToolbarController } from '../components/ToolbarController.js';
import { BrushController } from '../components/BrushController.js';
import { PencilController } from '../components/PencilController.js';

export class ProfileController {

	constructor(profile, userdata) {
		this.user = new User(userdata);

		this.message = profile.message;
		this.navbar = profile.navbar;
		this.userinfo = profile.navbar.userinfo;
		this.table = profile.table;
		this.toolbar = profile.toolbar;
		this.brush = profile.toolbar.brush;
		this.pencil = profile.toolbar.pencil;
		this.dialog = profile.dialog;
		this.customCursor = profile.customCursor;

		this.localStorageHelper = new LocalStorageHelper();
		this.currentArray = new CurrentArray(this.user.id, profile.table);
		this.listenerHandler = ListenerHandlerSingleton.getInstance();
		this.userAttendanceRepository = new UserAttendanceRepository();

		this.messageController = new MessageController(this.message);
		this.navBarController = new NavBarController(this.navbar, this.user.avatar);
		this.userInfoController = new UserInfoController(this.userinfo, this.user, this.dialog);
		this.tableController = new TableController(
			this.table,
			this.toolbar,
			this.message,
			this.customCursor,
			this.user.id,
			this.currentArray
		);
		this.toolbarController = new ToolbarController(
			this.toolbar,
			this.table,
			this.dialog,
			this.message,
			this.user,
			() => { this.tableController.refresh(); },
			() => { this.tableController.init(); }
		)
		this.brushController = new BrushController(
			this.toolbar,
			this.table,
			this.message,
			this.customCursor,
			this.currentArray,
			this.user.id,
			() => { this.#resetDocumentListeners(); },
			(array, rowId, toolMethod, cancelFunction) => {
				this.#resetTableRow(array, rowId, toolMethod, cancelFunction);
			},
			(loader) => { this.#save(loader); }
		);
		this.pencilController = new PencilController(
			this.toolbar,
			this.table,
			this.message,
			this.customCursor,
			this.user,
			this.currentArray,
			() => { this.#resetDocumentListeners(); },
			(array, rowId, toolMethod, cancelFunction) => {
				this.#resetTableRow(array, rowId, toolMethod, cancelFunction);
			},
			(array) => { this.brushController.setBrush(array); }
		);
		
	}

	init() {

		this.#resetDocumentListeners();

		this.messageController.init();
		this.navBarController.init();
		this.userInfoController.init();
		this.tableController.init();
		this.toolbarController.init();
		this.pencilController.init();
		this.brushController.init();

		// where 'logged_in' is a flag variable saved in local storage that says if the user logged in before
		if (!this.localStorageHelper.exists('logged_in')) {
			this.message.show(
				"User logged in successfully: Welcome, " + this.user.username, 
				MessageTypeEnum.SUCCESS);
			this.localStorageHelper.set.single('logged_in', true);
		}

		// Explicitly set cursor to auto for elements that are on a higher layer than the base one
		// This is needed for a better custom cursors behaviour

		const allElements = [ document.body, ...findRoots(document.body) ];

		let floatingElements = [];

		allElements.forEach(element => {
			floatingElements.push(Array.prototype.slice.call(element.querySelectorAll('*')));
		});

		floatingElements = floatingElements.flat().filter(element => {
			let position = window.getComputedStyle(element).getPropertyValue('position');
			let zIndex = parseInt(window.getComputedStyle(element).getPropertyValue('z-index'));
			return position == 'absolute' || position == 'fixed' || zIndex >= 1;
		});

		console.log(floatingElements);
		
		floatingElements.forEach(floatingElement => {
			floatingElement.style.cursor = 'auto';
		});

	}

	#resetDocumentListeners() {
		console.log('Resetting document listeners...')
		this.listenerHandler.removeAllListeners(document, 'click');
		this.listenerHandler.removeAllListeners(document, 'mousedown');
		this.listenerHandler.removeAllListeners(document, 'mouseup');
		this.#initializeDocumentListeners();
	}

	#initializeDocumentListeners() {

		this.listenerHandler.addListener(document, 'click', (event) => {
			let userContainer = this.navbar.user;

			// If the target of the click isn't the container nor a descendant of the container
			// Thanking lamplight: https://lamplightdev.com/blog/2021/04/10/how-to-detect-clicks-outside-of-a-web-component/
			if (!event.composedPath().includes(userContainer)) {
					this.userinfo.close();
			}

			let cells = this.table.cells;
			let pencilColors = this.pencil.options;

			// If the target of the click isn't the container nor a descendant of the container
			if (!event.composedPath().includes(pencilColors)) {
				let isNotCell = true;
				cells.forEach(cell => {
					if(event.composedPath().includes(cell)) {
						isNotCell = false;
					}
				});
				if(isNotCell) {
					this.pencil.hideOptions();
				}
			}

		}, false);

	}


	#resetTableRow(array, rowId, toolMethod = () => {}, cancelFunction = () => {}) {
		let discardButton = new DialogButtonData(
			'Discard', 
			() => {
				this.table.recolorTableRow(array, rowId, this.message);
				toolMethod();
				this.dialog.hide();
			}
		);
		let saveButton = new DialogButtonData(
			'Save', 
			() => {
				this.#save(this.dialog.loader);
				toolMethod();
			}, 
			true
		);

		this.dialog.show(
			'Warning: you are leaving brush mode with unsaved changes. Do you want to save them?', 
			[ discardButton, saveButton ],
			true,
			() => {
				this.brush.check();
				cancelFunction();
			}

		);
	}

	#save(loader) {
	 	this.currentArray.update();
	 	loader.show();

		this.userAttendanceRepository.updateDatabaseEntry(
			this.user,
			this.toolbar.getMonth(),
			this.currentArray.array
		)
		.then(response => {
	        loader.hide();
	        this.dialog.hide();

	        console.log(response);
	    })
	    .catch(error => {

	        if (error instanceof UserAttendanceRepositoryError) {
	        	loader.hide();

	        	this.message.show(
	            	`<div><b>Status:</b> &#10006; Error </div> <br>
	            	<div><b>Error Type:</b> ${error.status} - ${error.description}</div>
	            	<div><b>Description:</b> ${error.error}</div>`,
	            	MessageTypeEnum.ERROR
	        	);

	        	this.tableController.refresh();
				this.currentArray.update();
	        }
	        else {
	        	throw error;
	        }
	        
	    });

		this.message.close();
	}

}