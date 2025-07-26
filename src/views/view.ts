export class View {
    private video: HTMLVideoElement;
    private textInput: HTMLInputElement;
    private sendButton: HTMLButtonElement;
    private voiceButton: HTMLButtonElement;
    private chatHistory: HTMLDivElement;
    private settingsButton: HTMLButtonElement;
    private cameraSwitchButton: HTMLButtonElement;
    private cameraOffButton: HTMLButtonElement;
    private settingsContainer: HTMLDivElement;
    private aiModelSelect: HTMLSelectElement;
    private aiModelInput: HTMLInputElement;
    private aiModelSelect2: HTMLSelectElement;
    private aiModelInput2: HTMLInputElement;
    private systemMessageInput: HTMLTextAreaElement;
    private voicePromptInput: HTMLInputElement;
    private mediaRecorder: MediaRecorder | null = null;
    private audioChunks: Blob[] = [];
    private _audioStream: MediaStream | null = null;
    private _videoStream: MediaStream | null = null;
    private recordingStartTime: number = 0;
    private currentCameraFacingMode: 'user' | 'environment' = 'environment'; // Default to back camera
    private _isCameraOn: boolean = true;

    constructor() {
        this.video = document.getElementById('video') as HTMLVideoElement;
        this.textInput = document.getElementById('text-input') as HTMLInputElement;
        this.sendButton = document.getElementById('send-button') as HTMLButtonElement;
        this.voiceButton = document.getElementById('voice-button') as HTMLButtonElement;
        this.chatHistory = document.getElementById('chat-history') as HTMLDivElement;
        this.settingsButton = document.getElementById('settings-button') as HTMLButtonElement;
        this.cameraSwitchButton = document.getElementById('camera-switch-button') as HTMLButtonElement;
        this.cameraOffButton = document.getElementById('camera-off-button') as HTMLButtonElement;
        this.settingsContainer = document.getElementById('settings-container') as HTMLDivElement;
        this.settingsContainer.style.display = 'none';
        this.aiModelSelect = document.getElementById('ai-model-select') as HTMLSelectElement;
        this.aiModelInput = document.getElementById('ai-model-input') as HTMLInputElement;
        this.aiModelSelect2 = document.getElementById('ai-model-select-2') as HTMLSelectElement;
        this.aiModelInput2 = document.getElementById('ai-model-input-2') as HTMLInputElement;
        this.systemMessageInput = document.getElementById('system-message-input') as HTMLTextAreaElement;
        this.voicePromptInput = document.getElementById('voice-prompt-input') as HTMLInputElement;
        this.systemMessageInput = document.getElementById('system-message-input') as HTMLTextAreaElement;
        this.voicePromptInput = document.getElementById('voice-prompt-input') as HTMLInputElement;

        this.settingsButton.addEventListener('pointerup', () => {
            if (this.settingsContainer.style.display === 'flex') {
                this.settingsContainer.style.display = 'none';
            } else {
                this.settingsContainer.style.display = 'flex';
            }
        });

        this.cameraSwitchButton.addEventListener('pointerup', () => {
            this.switchCamera();
        });

        this.aiModelSelect.addEventListener('change', () => {
            this.aiModelInput.value = this.aiModelSelect.value;
        });

        this.aiModelInput.addEventListener('input', () => {
            this.aiModelSelect.value = this.aiModelInput.value;
        });

        this.aiModelSelect2.addEventListener('change', () => {
            this.aiModelInput2.value = this.aiModelSelect2.value;
        });

        this.aiModelInput2.addEventListener('input', () => {
            this.aiModelSelect2.value = this.aiModelInput2.value;
            this.saveSettings();
        });

        this.systemMessageInput.addEventListener('input', () => {
            this.saveSettings();
        });

        this.voicePromptInput.addEventListener('input', () => {
            this.saveSettings();
        });

        this.initializeMedia();
        this.loadSettings();

        this.systemMessageInput.addEventListener('input', () => {
            this.saveSettings();
        });

        this.voicePromptInput.addEventListener('input', () => {
            this.saveSettings();
        });

        this.loadSettings();
    }

    private async initializeMedia(): Promise<void> {
        try {
            // Get both audio and video streams
            this._videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.currentCameraFacingMode }
            });
            this._audioStream = await navigator.mediaDevices.getUserMedia({
                audio: true
            });

            this.video.srcObject = this._videoStream;
            this.setupMediaRecorder(this._audioStream);
            this._isCameraOn = true;
        } catch (error) {
            console.error('Error accessing media devices:', error);
        }
    }

    public addCameraOffButtonListener(handler: () => void): void {
        this.cameraOffButton.addEventListener('pointerup', handler);
    }

    public addAiModelChangeListener(handler: (model: string) => void): void {
        this.aiModelSelect.addEventListener('change', () => handler(this.aiModelSelect.value));
        this.aiModelInput.addEventListener('input', () => handler(this.aiModelInput.value));
    }

    public addAiModel2ChangeListener(handler: (model: string) => void): void {
        this.aiModelSelect2.addEventListener('change', () => handler(this.aiModelSelect2.value));
        this.aiModelInput2.addEventListener('input', () => handler(this.aiModelInput2.value));
    }

    public getAiModel(): string {
        return this.aiModelInput.value;
    }

    public getAiModel2(): string {
        return this.aiModelInput2.value;
    }

    public getSystemMessage(): string {
        return this.systemMessageInput.value;
    }

    public getVoicePrompt(): string {
        return this.voicePromptInput.value;
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
        let pointdownhandle = (e) => {
            e.preventDefault();
            this.recordingStartTime = Date.now();
            startHandler();
            this.voiceButton.classList.add('recording-background');
        }
        let pointeruphandle = async (e) => {
            console.log("pointerup");

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

        this.voiceButton.addEventListener('pointerup', pointeruphandle);
        this.video.addEventListener('pointerup', pointeruphandle);

        this.video.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        })
    }

    public displayMessage(sender: string, message: string, audioSrc?: string, imageUrl?: string, autoplay: boolean = false): void {
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
            if (autoplay) {
                audioElement.setAttribute('autoplay', 'true');
            }
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
            // Stop current video track if any
            if (this._videoStream) {
                this._videoStream.getTracks().forEach(track => track.stop());
            }

            this._videoStream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: this.currentCameraFacingMode }
            });
            this.video.srcObject = this._videoStream;
            this._isCameraOn = true;
        } catch (error) {
            console.error('Error accessing camera:', error);
            this._isCameraOn = false; // Ensure camera state is false on error
        }
    }

    private async switchCamera(): Promise<void> {
        // Stop current video track
        if (this._videoStream) {
            this._videoStream.getTracks().forEach(track => track.stop());
        }

        // Toggle camera facing mode
        this.currentCameraFacingMode = this.currentCameraFacingMode === 'user' ? 'environment' : 'user';

        // Start camera with new facing mode
        await this.startCamera();
    }

    public toggleCamera(): void {
        if (this._isCameraOn) {
            // Turn off camera (video only)
            if (this._videoStream) {
                this._videoStream.getTracks().forEach(track => track.stop());
                this.video.srcObject = null;
            }
            this._isCameraOn = false;
        } else {
            // Turn on camera (video only)
            this.startCamera();
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
        if (!this._isCameraOn || !this.video.srcObject) {
            return ''; // Return empty string if camera is off or no stream
        }
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

    private saveSettings(): void {
        localStorage.setItem('aiModel', this.aiModelInput.value);
        localStorage.setItem('aiModel2', this.aiModelInput2.value);
        localStorage.setItem('systemMessage', this.systemMessageInput.value);
        localStorage.setItem('voicePrompt', this.voicePromptInput.value);
    }

    private loadSettings(): void {
        const aiModel = localStorage.getItem('aiModel');
        if (aiModel) {
            this.aiModelInput.value = aiModel;
            this.aiModelSelect.value = aiModel;
        }
        const aiModel2 = localStorage.getItem('aiModel2');
        if (aiModel2) {
            this.aiModelInput2.value = aiModel2;
            this.aiModelSelect2.value = aiModel2;
        }
        const systemMessage = localStorage.getItem('systemMessage');
        if (systemMessage) {
            this.systemMessageInput.value = systemMessage;
        } else {
            
        }
        const voicePrompt = localStorage.getItem('voicePrompt');
        if (voicePrompt) {
            this.voicePromptInput.value = voicePrompt;
        }
    }
}
