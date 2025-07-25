export class Model {
    private apiUrl = 'https://geminiopenaifree.deno.dev/v1/chat/completions';

    public async sendMessage(text: string, image: string, audio: string): Promise<string> {
        const payload: any = {
            model: 'gemini-2.5-flash',
            messages: [
                {
                    role: 'user',
                    content: [
                        { type: 'text', text },
                    ]
                }
            ],
            max_tokens: 1000
        };

        if (image) {
            payload.messages[0].content.push({ type: 'image_url', image_url: { url: image } });
        }

        if (audio) {
            payload.messages[0].content.push({ type: 'input_audio', input_audio: { data: audio, format: 'wav' } });
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
