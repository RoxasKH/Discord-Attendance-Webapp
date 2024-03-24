import { ToolTypeEnum } from "../../utils/enums/ToolTypeEnum.js";

export class ToolbarState {

    selected = false;
    tool = ToolTypeEnum.PENCIL;

    constructor(
        selected,
        tool
    ) {
        this.selected = selected;
        this.tool = tool;
    }

}