export class View {
    private video: HTMLVideoElement;
    private textInput: HTMLInputElement;
    private sendButton: HTMLButtonElement;
    private voiceButton: HTMLButtonElement;
    private chatHistory: HTMLDivElement;
    private settingsButton: HTMLButtonElement;
    private cameraSwitchButton: HTMLButtonElement;
    private settingsContainer: HTMLDivElement;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private recordingStartTime: number = 0;
    private currentCameraFacingMode: 'user' | 'environment' = 'environment'; // Default to back camera

    constructor() {
        this.video = document.getElementById('video') as HTMLVideoElement;
        this.textInput = document.getElementById('text-input') as HTMLInputElement;
        this.sendButton = document.getElementById('send-button') as HTMLButtonElement;
        this.voiceButton = document.getElementById('voice-button') as HTMLButtonElement;
        this.chatHistory = document.getElementById('chat-history') as HTMLDivElement;
        this.settingsButton = document.getElementById('settings-button') as HTMLButtonElement;
        this.cameraSwitchButton = document.getElementById('camera-switch-button') as HTMLButtonElement;
        this.settingsContainer = document.getElementById('settings-container') as HTMLDivElement;

        this.settingsButton.addEventListener('pointerup', () => {
            this.settingsContainer.hidden = !this.settingsContainer.hidden;
        });

        this.cameraSwitchButton.addEventListener('pointerup', () => {
            this.switchCamera();
        });
    }

    public getTextInputValue(): string {
        return this.textInput.value;
    }

    public clearTextInput(): void {
        this.textInput.value = '';
    }

    public addSendMessageListener(handler: () => void): void {
        this.sendButton.addEventListener('pointerup', handler);
        this.textInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                handler();
            }
        });
    }

    public addVoiceButtonListeners(startHandler: () => void, stopHandler: (audioData: string) => void): void {
        let pointdownhandle=(e)=> {
            e.preventDefault();
            this.recordingStartTime = Date.now();
            startHandler();
            this.voiceButton.classList.add('recording-background');
        }
        let pointeruphandle=async (e) => {
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
            this.voiceButton.classList.remove('recording-background');

        }

        this.voiceButton.addEventListener('pointerdown', pointdownhandle);
        this.video.addEventListener('pointerdown', pointdownhandle);

        this.voiceButton.addEventListener('pointerup',pointeruphandle );
        this.video.addEventListener('pointerup', pointeruphandle);

    }

    public displayMessage(sender: string, message: string, audioSrc?: string, imageUrl?: string): void {
        const messageElement = document.createElement('div');
        messageElement.classList.add('chat-message');
        messageElement.classList.add(sender.toLowerCase() + '-message'); // Add class for sender

        const textElement = document.createElement('div');
        textElement.innerHTML = `<strong>${sender}:</strong> ${message}`;
        messageElement.appendChild(textElement);

        if (imageUrl) {
            const imageWrapper = document.createElement('div');
            imageWrapper.classList.add('message-image-wrapper');
            const imageElement = document.createElement('img');
            imageElement.src = imageUrl;
            imageElement.classList.add('thumbnail'); // Add a class for styling
            imageElement.addEventListener('pointerup', () => {
                this.enlargeImage(imageUrl);
            });
            imageWrapper.appendChild(imageElement);
            messageElement.appendChild(imageWrapper);
        }

        if (audioSrc) {
            const audioWrapper = document.createElement('div');
            audioWrapper.classList.add('message-audio-wrapper');
            const audioElement = document.createElement('audio');
            audioElement.controls = true;
            audioElement.src = audioSrc;
            audioElement.setAttribute('autoplay', 'true');
            audioWrapper.appendChild(audioElement);
            messageElement.appendChild(audioWrapper);
        }
        this.chatHistory.appendChild(messageElement);
        this.chatHistory.scrollTop = this.chatHistory.scrollHeight;
    }

    private enlargeImage(imageUrl: string): void {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.addEventListener('pointerup', () => {
            document.body.removeChild(modal);
        });

        const modalContent = document.createElement('img');
        modalContent.src = imageUrl;
        modalContent.classList.add('modal-content');

        modal.appendChild(modalContent);
        document.body.appendChild(modal);
    }

    public async startCamera(): Promise<void> {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.currentCameraFacingMode },
                audio: true
            });
            this.video.srcObject = stream;
            this.setupMediaRecorder(stream);
        } catch (error) {
            console.error('Error accessing camera:', error);
        }
    }

    private async switchCamera(): Promise<void> {
        // Stop current video track
        if (this.video.srcObject) {
            (this.video.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }

        // Toggle camera facing mode
        this.currentCameraFacingMode = this.currentCameraFacingMode === 'user' ? 'environment' : 'user';

        // Start camera with new facing mode
        await this.startCamera();
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
