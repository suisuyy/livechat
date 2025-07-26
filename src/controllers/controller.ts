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

        // Set initial AI model
        this.model.setAiModel(this.view.getAiModel());

        // Listen for changes in AI model selection
        this.view.addAiModelChangeListener((model: string) => {
            this.model.setAiModel(model);
        });
    }

    private async handleSendMessage(): Promise<void> {
        let text = this.view.getTextInputValue();
        if (!text) {
            text='descibe what you see and listen for me';
        }

        const image = this.view.captureVideoFrame();
        this.view.displayMessage('You', text, undefined, image);
        this.view.clearTextInput();

        const response = await this.model.sendMessage(text, image, '', '');
        this.view.displayMessage(this.model.AImodel || 'AI', response);
    }

    private handleStartRecording(): void {
            this.view.startRecording();
    }

    private async handleStopRecording(audioData: string): Promise<void> {
        const audioDataUrl = `data:audio/mp4;base64,${audioData}`;
        const image = this.view.captureVideoFrame();
        this.view.displayMessage('You', '[Audio Message]', audioDataUrl, image);
        const response = await this.model.sendMessage('', image, audioData, 'audio/mp4');
        const aiAudioSrc = `https://text.pollinations.ai/now speak like japanese anime girl, cute and tender; just repeat following text:${encodeURIComponent(response)}?model=openai-audio&voice=sage`;
        this.view.displayMessage('AI', response, aiAudioSrc);
    }
}