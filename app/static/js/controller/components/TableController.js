export class TableController {

    constructor(
        table,
        toolbar,
        message,
        customCursor,
        userid,
        currentArray,
    ) {
        this.table = table;
        this.toolbar = toolbar;
        this.brush = toolbar.brush;
        this.customCursor = customCursor;
        this.message = message;
        this.userid = userid;
        this.currentArray = currentArray;
    }

    init() {
        this.table.update(
			this.userid,
			this.toolbar.getMonth(),
			this.message,
			this.currentArray
		);
    }

    refresh() {
		// Resetting tool buttons
		this.toolbar.setToolSelection();
		this.customCursor.reset();
		this.brush.hideOptions();
		this.table.setEditMode(this.toolbar, this.userid);
		this.init();
	}

}