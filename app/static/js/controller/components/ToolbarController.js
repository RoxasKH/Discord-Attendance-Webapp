import { DialogButtonData } from "../../model/DialogButtonData.js";
import { UserAttendanceRepository } from "../../repository/UserAttendanceRepository.js";
import { UserAttendanceRepositoryError } from "../../repository/UserAttendanceRepositoryError.js";
import { MessageTypeEnum } from "../../utils/enums/MessageTypeEnum.js";

export class ToolbarController {

    #refreshTable = () => {};
    #initializeTable = () => {};

    constructor(
        toolbar, 
        table, 
        dialog, 
        message, 
        user,
        refreshTable,
        initializeTable
    ) {
        this.toolbar = toolbar;
        this.table = table;
        this.dialog = dialog;
        this.message = message;
        this.user = user;
        this.#refreshTable = refreshTable;
        this.#initializeTable = initializeTable;

        this.userAttendanceRepository = new UserAttendanceRepository();
    }

    init() {
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

				this.message.show(
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