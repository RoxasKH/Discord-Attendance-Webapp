import { arraysEqual } from "../../utils/Utils.js";
import { ToolTypeEnum } from "../../utils/enums/ToolTypeEnum.js";

export class PencilController {

    #resetDocumentListeners = () => {};
    #resetTableRow = () => {};
    #setBrush = () => {};

    constructor(
        toolbar, 
        table,
        message,
        customCursor,
        user,
        currentArray,
        resetDocumentListeners,
        resetTableRow,
        setBrush
    ) {
        this.toolbar = toolbar;
        this.pencil = toolbar.pencil;
        this.brush = toolbar.brush;
        this.table = table;
        this.message = message;
        this.customCursor = customCursor;
        this.user = user;
        this.currentArray = currentArray;
        this.#resetDocumentListeners = resetDocumentListeners;
        this.#resetTableRow = resetTableRow;
        this.#setBrush = setBrush;
    }

    init() {
        this.pencil.initializeColors();
		this.pencil.button.addEventListener('change', () => {
			this.#setPencil();
		});
    }

    #setPencil() {

		this.table.initializeEventHandlers();
		this.#resetDocumentListeners();
		this.toolbar.setToolSelection(ToolTypeEnum.PENCIL);
		this.table.setEditMode(this.toolbar, this.user.id);
		this.customCursor.set(this.pencil, ToolTypeEnum.PENCIL);
		if(this.pencil.isChecked()) {
			this.table.setPencilEventListener(
                this.user, 
                this.toolbar.getMonth(), 
                this.pencil, 
                this.currentArray, 
                this.message
            );
		}

		this.brush.hideOptions();

		if(!(arraysEqual(this.currentArray.array, this.currentArray.get(this.user.id))) && this.currentArray.array != null) {
			this.#resetTableRow(
				this.currentArray.array, 
				this.user.id, 
				undefined, // Basically, skip a parameter
				() => {
					let saveCurrentArrayState = this.currentArray.array;
					this.#setBrush(saveCurrentArrayState);
				}
			);
		}

	}

}