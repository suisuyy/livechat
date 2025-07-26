export class Model {
    private apiUrl = 'https://geminiopenaifree.deno.dev/v1/chat/completions';
    AImodel: string;
    config: { 
        max_tokens: number; 
        temperature: number;
         top_p: number; 
         stream: boolean; stop: null; 
        };
    public setAiModel(model: string): void {
        this.AImodel = model;
    }

    constructor() {
        this.AImodel='gemini-2.5-flash-lite';
        this.config={
            max_tokens: 16000,
            temperature: 0.7,
            top_p: 1,
            stream: false,
            stop: null
        }
    }

    public async sendMessage(text: string, image: string, audio: string, audioFormat: string): Promise<string> {
        const payload: any = {
            model: this.AImodel,
            messages: [
                {
                    role:'system',
                    content: [
                        { type: 'text', text: 'You are a helpful assistant.please be concise, do not speak too much every time, be short, just like normal talk between 2 friends' },
                    ]
                }
                ,
                {
                    role: 'user',
                    content: []
                }
                
            ],
            ...this.config
        };

        if(text){
            payload.messages[1].content.push({ type: 'text', text: text });
        }

        if (image) {
            payload.messages[1].content.push({ type: 'image_url', image_url: { url: image } });
        }

        if (audio) {
            payload.messages[1].content.push({ type: 'input_audio', input_audio: { data: audio, format: audioFormat } });
        }

        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('Error sending message:', error);
            return 'Error: Could not connect to the server.';
        }
    }
}
