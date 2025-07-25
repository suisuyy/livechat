import { View } from '../views/view';
import { Model } from '../models/model';

export class Controller {
    private view: View;
    private model: Model;

    constructor(view: View, model: Model) {
        this.view = view;
        this.model = model;

        this.view.addSendMessageListener(this.handleSendMessage.bind(this));
        this.view.startCamera();
    }

    private async handleSendMessage(): Promise<void> {
        const text = this.view.getTextInputValue();
        if (!text) {
            return;
        }

        this.view.displayMessage('You', text);
        this.view.clearTextInput();

        const image = this.view.captureVideoFrame();
        const response = await this.model.sendMessage(text, image, '');
        this.view.displayMessage('AI', response);
    }
}
