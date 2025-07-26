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
        this.view.addCameraOffButtonListener(this.handleCameraOff.bind(this));
        this.view.startCamera();

        // Set initial AI model
        this.model.setAiModel(this.view.getAiModel());
        this.model.setAiModel2(this.view.getAiModel2());
        this.model.setSystemMessage(this.view.getSystemMessage());
        this.model.setVoicePrompt(this.view.getVoicePrompt());

        // Listen for changes in AI model selection
        this.view.addAiModelChangeListener((model: string) => {
            this.model.setAiModel(model);
        });

        this.view.addAiModel2ChangeListener((model: string) => {
            this.model.setAiModel2(model);
        });

        this.view.systemMessageInput.addEventListener('input', () => {
            this.model.setSystemMessage(this.view.getSystemMessage());
        });

        this.view.voicePromptInput.addEventListener('input', () => {
            this.model.setVoicePrompt(this.view.getVoicePrompt());
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

        const response1 = await this.model.sendMessage(text, image, '', '', this.model.AImodel);
        this.view.displayMessage(this.model.AImodel || 'AI', response1);

        const response2 = await this.model.sendMessage(text, image, '', '', this.model.AImodel2);
        this.view.displayMessage(this.model.AImodel2 || 'AI', response2);
    }

    private handleStartRecording(): void {
            this.view.startRecording();
    }

    private async handleStopRecording(audioData: string): Promise<void> {
        const audioDataUrl = `data:audio/mp4;base64,${audioData}`;
        const image = this.view.captureVideoFrame();
        this.view.displayMessage('You', '[Audio Message]', audioDataUrl, image);
        let text = this.view.getTextInputValue();
        const response1 = await this.model.sendMessage(text, image, audioData, 'audio/mp4', this.model.AImodel);
        const aiAudioSrc1 = `https://text.pollinations.ai/${encodeURIComponent(this.model.voicePrompt)}${encodeURIComponent(response1)}?model=openai-audio&voice=sage`;
        this.view.displayMessage(this.model.AImodel || 'AI', response1, aiAudioSrc1, undefined, true);

        const response2 = await this.model.sendMessage('', image, audioData, 'audio/mp4', this.model.AImodel2);
        const aiAudioSrc2 = `https://text.pollinations.ai/${encodeURIComponent(this.model.voicePrompt)}${encodeURIComponent(response2)}?model=openai-audio&voice=sage`;
        this.view.displayMessage(this.model.AImodel2 || 'AI', response2, aiAudioSrc2, undefined, false);
    }

    private handleCameraOff(): void {
        this.view.toggleCamera();
    }
}