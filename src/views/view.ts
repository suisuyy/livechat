export class View {
    private video: HTMLVideoElement;
    private textInput: HTMLInputElement;
    private sendButton: HTMLButtonElement;
    private chatHistory: HTMLDivElement;

    constructor() {
        this.video = document.getElementById('video') as HTMLVideoElement;
        this.textInput = document.getElementById('text-input') as HTMLInputElement;
        this.sendButton = document.getElementById('send-button') as HTMLButtonElement;
        this.chatHistory = document.getElementById('chat-history') as HTMLDivElement;
    }

    public getTextInputValue(): string {
        return this.textInput.value;
    }

    public clearTextInput(): void {
        this.textInput.value = '';
    }

    public addSendMessageListener(handler: () => void): void {
        this.sendButton.addEventListener('click', handler);
    }

    public displayMessage(sender: string, message: string): void {
        const messageElement = document.createElement('div');
        messageElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        this.chatHistory.appendChild(messageElement);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    public async startCamera(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            this.video.srcObject = stream;
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    }

    public captureVideoFrame(): string {
        const canvas = document.createElement('canvas');
        canvas.width = this.video.videoWidth;
        canvas.height = this.video.videoHeight;
        const context = canvas.getContext('2d');
        if (context) {
            context.drawImage(this.video, 0, 0, canvas.width, canvas.height);
            return canvas.toDataURL('image/jpeg');
        }
        return '';
    }
}
