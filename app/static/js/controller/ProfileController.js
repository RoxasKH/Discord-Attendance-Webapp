import { MessageTypeEnum } from '../utils/enums/MessageTypeEnum.js'
import { ToolTypeEnum } from '../utils/enums/ToolTypeEnum.js'
import { LocalStorageHelper } from '../utils/LocalStorageHelper.js'
import { CurrentArray } from '../model/CurrentArray.js';
import { ListenerHandlerSingleton } from '../utils/ListenerHandlerSingleton.js'
import { DialogButtonData } from '../model/DialogButtonData.js'
import { UserAttendanceRepository } from '../repository/UserAttendanceRepository.js'
import { UserAttendanceRepositoryError } from '../repository/UserAttendanceRepositoryError.js'
import { arraysEqual, findRoots } from '../utils/Utils.js'
import { User } from '../model/User.js';

export class ProfileController {

	constructor(profile, userdata) {
		this.localStorageHelper = new LocalStorageHelper();

		this.user = new User(userdata);

		this.Profile = profile;

		this.message = profile.message;
		this.navbar = profile.navbar;
		this.userinfo = profile.navbar.userinfo;
		this.toolbar = profile.toolbar;
		this.table = profile.table;
		this.dialog = profile.dialog;
		this.customCursor = profile.customCursor;

		this.currentArray = new CurrentArray(this.user.id, profile.table);

		this.listenerHandler = ListenerHandlerSingleton.getInstance();

		this.userAttendanceRepository = new UserAttendanceRepository();
	}

	init() {

		this.#resetDocumentListeners();

		this.#initializeMessage();
		this.#initializeNavBar();
		this.#initializeUserInfo();
		this.#initializeTable();
		this.#initializeToolbar();
		this.#initializePencil();
		this.#initializeBrush();

		if (!this.localStorageHelper.exists('logged_in')) { // where 'logged_in' is a flag variable saved in local storage that says if the user logged in before
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
			let pencilColors = this.toolbar.pencil.options;

			// If the target of the click isn't the container nor a descendant of the container
			if (!event.composedPath().includes(pencilColors)) {
				let isNotCell = true;
				cells.forEach(cell => {
					if(event.composedPath().includes(cell)) {
						isNotCell = false;
					}
				});
				if(isNotCell) {
					this.toolbar.pencil.hideOptions();
				}
			}

		}, false);

	}


	#initializeMessage() {
		this.message.close_button.addEventListener('click', () => {
			this.message.close();
		});
	}

	#initializeNavBar() {
		this.navbar.setUserAvatar(this.user.avatar);
		this.navbar.user_avatar.addEventListener('click', () => {
			this.navbar.user_avatar.classList.add('bounce-in');
			this.navbar.user_avatar.addEventListener('animationend', () => {
				this.navbar.user_avatar.classList.remove('bounce-in');
			});
			this.userinfo.toggle();
		});
	}

	#initializeUserInfo() {
		this.userinfo.setUserInfos(
			this.user.avatar, 
			this.user.username, 
			this.user.discriminator, 
			this.user.nick, 
			this.user.joined_at
		);
		this.userinfo.logoutButton.addEventListener('click', () => {
			// Bind is needed to bind the right context where to call the function
			// Alternative option is to pass an anonymous function
			let logoutButton = new DialogButtonData('Logout', this.#logoutRedirect.bind(this), true);
			this.dialog.show(
				'Are you sure you want to log out from the application?', 
				[ logoutButton ],
				false
			);
		});
	}

	#initializeTable() {
		this.table.update(
			this.user.id,
			this.toolbar.getMonth(),
			this.message,
			this.currentArray
		);
	}

	#refreshTable() {
		// Resetting tool buttons
		this.toolbar.setToolSelection();
		this.customCursor.reset();
		this.toolbar.brush.hideOptions();
		this.table.setEditMode(this.toolbar, this.user.id);
		this.#initializeTable();
	}

	#initializeToolbar() {
		this.toolbar.reloadButton.addEventListener('click', () => {
			this.#refreshTable();
		});
		this.toolbar.monthCombobox.addEventListener('change', () => {
			this.#initializeTable();
		});
		this.toolbar.clearButton.addEventListener('click', () => {
			let clearButton = new DialogButtonData('Clear', this.#clearAttendance.bind(this), true);
			this.dialog.show(
				'Are you sure you wanna clear your attendance for this month? This change cannot be reverted back.', 
				[ clearButton ],
				false
			);
		});
	}

	#initializePencil() {
		this.toolbar.pencil.initializeColors();
		this.toolbar.pencil.button.addEventListener('change', () => {
			this.setPencil();
		});
	}

	#initializeBrush() {
		this.toolbar.brush.initializeColors();
		this.toolbar.brush.button.addEventListener('change', () => {
			this.setBrush();
		});
		this.toolbar.brush.saveButton.addEventListener('click', () => {
			this.save(this.toolbar.brush.loader);
		});
	}


	setPencil() {

		this.table.initializeEventHandlers();
		this.#resetDocumentListeners();
		this.toolbar.setToolSelection(ToolTypeEnum.PENCIL);
		this.table.setEditMode(this.toolbar, this.user.id);
		this.customCursor.set(this.toolbar.pencil, ToolTypeEnum.PENCIL);
		if(this.toolbar.pencil.isChecked()) {
			this.table.setPencilEventListener(this.user, this.toolbar.getMonth(), this.toolbar.pencil, this.currentArray, this.message);
		}

		this.toolbar.brush.hideOptions();

		if(!(arraysEqual(this.currentArray.array, this.currentArray.get(this.user.id))) && this.currentArray.array != null) {
			this.resetTableRow(
				this.currentArray.array, 
				this.user.id, 
				undefined, // Basically, skip a parameter
				() => {
					let saveCurrentArrayState = this.currentArray.array;
					this.setBrush(saveCurrentArrayState);
				}
			);
		}

	}

	setBrush(array = null) {
		
		if(this.toolbar.brush.isChecked()) {

			this.toggleBrush();

			if(array != null)
				this.currentArray.array = array;
			else
				this.currentArray.update();

			this.table.setBrushEventListener(this.user.id, this.toolbar.brush, this.currentArray, this.message);
		}
		else {
			console.log(this.currentArray.array);
			console.log(this.currentArray.get(this.user.id));
			if(!(arraysEqual(this.currentArray.array, this.currentArray.get(this.user.id))))
				this.resetTableRow(this.currentArray.array, this.user.id, this.toggleBrush.bind(this));
			else
				this.toggleBrush();
		}

	}

	toggleBrush() {
		this.table.initializeEventHandlers();
		this.#resetDocumentListeners();
		this.toolbar.setToolSelection(ToolTypeEnum.BRUSH);

		this.table.setEditMode(this.toolbar, this.user.id);
		this.customCursor.set(this.toolbar.brush, ToolTypeEnum.BRUSH);
		this.toolbar.brush.toggleOptions();
	}

	resetTableRow(array, rowId, toolMethod = function() {}, cancelFunction = function() {}) {
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
				this.save(this.dialog.loader);
				toolMethod();
			}, 
			true
		);

		this.dialog.show(
			'Warning: you are leaving brush mode with unsaved changes. Do you want to save them?', 
			[ discardButton, saveButton ],
			true,
			() => {
				this.toolbar.brush.check();
				cancelFunction();
			}

		);
	}

	save(loader) {
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
	        response.documents.forEach(user => 
	        	console.log(user.discord_user_name)
	        );
	    })
	    .catch(error => {

	        if (error instanceof UserAttendanceRepositoryError) {
	        	loader.hide();

	        	message.show(
	            	`<div><b>Status:</b> &#10006; Error </div> <br>
	            	<div><b>Error Type:</b> ${error.status} - ${error.description}</div>
	            	<div><b>Description:</b> ${error.error}</div>`,
	            	MessageTypeEnum.ERROR
	        	);

	        	this.#refreshTable();
				currentArray.update();
	        }
	        else {
	        	throw error;
	        }
	        
	    });

		this.message.close();
	}

	#logoutRedirect() {
		this.localStorageHelper.set.single('logged_in', false);
		window.location.replace('/logout'); // Redirect to the logout endpoint
	}

	#clearAttendance() {
		let emptyArray = [];
		for(let i = 0; i < this.table.getDaysNumber(); i++) {
			emptyArray.push(0);
		}

		this.dialog.loader.show();

		this.userAttendanceRepository.updateDatabaseEntry(
			this.user, 
			this.toolbar.getMonth(),
			emptyArray
		)
		.then(response => {
			this.table.recolorTableRow(emptyArray, this.user.id, this.message);
			this.dialog.loader.hide();
			this.dialog.hide();
		})
		.catch(error => {

			if (error instanceof UserAttendanceRepositoryError) {
				this.dialog.loader.hide();

				message.show(
					`<div><b>Status:</b> &#10006; Error </div> <br>
					<div><b>Error Type:</b> ${error.status} - ${error.description}</div>
					<div><b>Description:</b> ${error.error}</div>`,
					MessageTypeEnum.ERROR
				);
			}
			else {
				throw error;
			}

		});
	
	}

}