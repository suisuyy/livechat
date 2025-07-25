export class View {
    private video: HTMLVideoElement;
    private textInput: HTMLInputElement;
    private sendButton: HTMLButtonElement;
    private voiceButton: HTMLButtonElement;
    private chatHistory: HTMLDivElement;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private recordingStartTime: number = 0;

    constructor() {
        this.video = document.getElementById('video') as HTMLVideoElement;
        this.textInput = document.getElementById('text-input') as HTMLInputElement;
        this.sendButton = document.getElementById('send-button') as HTMLButtonElement;
        this.voiceButton = document.getElementById('voice-button') as HTMLButtonElement;
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
        this.textInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                handler();
            }
        });
    }

    public addVoiceButtonListeners(startHandler: () => void, stopHandler: (audioData: string) => void): void {
        this.voiceButton.addEventListener('mousedown', () => {
            this.recordingStartTime = Date.now();
            startHandler();
        });

        this.voiceButton.addEventListener('mouseup', async () => {
            const recordingDuration = Date.now() - this.recordingStartTime;
            if (recordingDuration >= 2000) { // Only send if recording is at least 2 seconds
                const audioData = await this.stopRecording();
                if (audioData) {
                    stopHandler(audioData);
                }
            } else {
                this.stopRecording(); // Stop recording but don't send if too short
                console.log("Recording too short, not sending.");
            }
        });
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
            this.setupMediaRecorder(stream);
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    }

    private setupMediaRecorder(stream: MediaStream): void {
        this.mediaRecorder = new MediaRecorder(stream);
        this.mediaRecorder.ondataavailable = (event) => {
            this.audioChunks.push(event.data);
        };
        this.mediaRecorder.onstop = () => {
            console.log("MediaRecorder stopped.");
        };
    }

    public startRecording(): void {
        if (this.mediaRecorder && this.mediaRecorder.state === 'inactive') {
            this.audioChunks = [];
            this.mediaRecorder.start();
            console.log("MediaRecorder started.");
        }
    }

    public async stopRecording(): Promise<string | null> {
        return new Promise((resolve) => {
            if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
                this.mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp4' });
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result?.toString().split(',')[1];
                        resolve(base64data || null);
                    };
                    reader.readAsDataURL(audioBlob);
                };
                this.mediaRecorder.stop();
            } else {
                resolve(null);
            }
        });
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
