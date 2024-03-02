export class MessageController {

    constructor(message) {
        this.message = message;
    }

    init() {
        this.message.close_button.addEventListener('click', () => {
			this.message.close();
		});
    }

}