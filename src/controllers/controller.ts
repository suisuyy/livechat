import { View } from '../views/view';
import { Model } from '../models/model';

export class Controller {
    private view: View;
    private model: Model;

    constructor(view: View, model: Model) {
        this.view = view;
        this.model = model;

        this.view.addSendMessageListener(this.handleSendMessage.bind(this));
        this.view.addVoiceButtonListeners(this.handleStartRecording.bind(this), this.handleStopRecording.bind(this));
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
        const response = await this.model.sendMessage(text, image, '', '');
        this.view.displayMessage('AI', response);
    }

    private handleStartRecording(): void {
        setTimeout(() => {
            this.view.startRecording();
        }, 200);
    }

    private async handleStopRecording(audioData: string): Promise<void> {
        const audioDataUrl = `data:audio/mp4;base64,${audioData}`;
        this.view.displayMessage('You', '[Audio Message]', audioDataUrl);
        const image = this.view.captureVideoFrame();
        const response = await this.model.sendMessage('', image, audioData, 'audio/mp4');
        const aiAudioSrc = `https://text.pollinations.ai/just repeat following text:${encodeURIComponent(response)}?model=openai-audio&voice=nova`;
        this.view.displayMessage('AI', response, aiAudioSrc);
    }
}