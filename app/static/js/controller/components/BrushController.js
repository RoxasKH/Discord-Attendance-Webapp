import { arraysEqual } from "../../utils/Utils.js";
import { ToolTypeEnum } from "../../utils/enums/ToolTypeEnum.js";

export class BrushController {

    #resetDocumentListeners = () => {};
    #resetTableRow = () => {};
    #save = () => {};

    constructor(
        toolbar, 
        table, 
        message, 
		customCursor,
        currentArray, 
        userid,
        resetDocumentListeners,
        resetTableRow,
        save
    ) {
        this.toolbar = toolbar;
        this.brush = toolbar.brush;
        this.table = table;
        this.message = message;
		this.customCursor = customCursor;
        this.currentArray = currentArray;
        this.userid = userid;
        this.#resetDocumentListeners = resetDocumentListeners;
        this.#resetTableRow = resetTableRow;
        this.#save = save;
    }

    init() {
        this.brush.initializeColors();
		this.brush.button.addEventListener('change', () => {
			this.setBrush();
		});
		this.brush.saveButton.addEventListener('click', () => {
			this.#save(this.brush.loader);
		});
    }

    setBrush(array = null) {
		
		if(this.brush.isChecked()) {

			this.#toggleBrush();

			if(array != null)
				this.currentArray.array = array;
			else
				this.currentArray.update();

			this.table.setBrushEventListener(this.userid, this.brush, this.currentArray, this.message);
		}
		else {
			console.log(this.currentArray.array);
			console.log(this.currentArray.get(this.userid));
			if(!(arraysEqual(this.currentArray.array, this.currentArray.get(this.userid))))
				this.#resetTableRow(this.currentArray.array, this.userid, this.#toggleBrush.bind(this));
			else
				this.#toggleBrush();
		}

	}

    #toggleBrush() {
		this.table.initializeEventHandlers();
		this.#resetDocumentListeners();
		this.toolbar.setToolSelection(ToolTypeEnum.BRUSH);

		this.table.setEditMode(this.toolbar, this.userid);
		this.customCursor.set(this.toolbar.brush, ToolTypeEnum.BRUSH);
		this.brush.toggleOptions();
	}

}