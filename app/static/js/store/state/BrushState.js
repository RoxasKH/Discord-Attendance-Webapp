export class BrushState {

    selectedColor = null;
    loading = false;

    constructor(
        selectedColor,
        loading
    ) {
        this.selectedColor = selectedColor;
        this.loading = loading;
    }

}