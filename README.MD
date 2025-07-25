LIVECHAT

THIS IS a chat with AI webapp focus on live camera chat, user can ask questions and get answers from AI, when in live mode witch is default mode, user can speak to mic with cameara open , when user finish speak(slilence for 2 second or manully press send button, ), it will send the the audio to AI model with the photo from camera, then user get text response and audio (if the model support return audio) from AI;

use google gemini to implement the function, the gemini model support image and audio text input , and return text, show the text to user


# api reference
use openai api compitable api, the api url is : https://geminiopenaifree.deno.dev/v1/chat/completions, this is free api, no api key needed. the model openai-audio seems support text, image and audio input
you can send image or audio like this :
# Get JSON response with image analysis
curl https://geminiopenaifree.deno.dev/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "model": "openai-audio",
    "messages": [
      {
        "role": "user",
        "content": [
          {"type": "text", "text": "What is in this image?"},
          {"type": "image_url", "image_url": {"url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/1024px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"}}
        ]
      }
    ],
    "max_tokens": 300
  }'

  you can put audio in content too:
  {
  "model": "openai-audio",
  "messages": [
    {
      "role": "user",
      "content": [
        { "type": "text", "text": "Transcribe this:" },
        {
          "type": "input_audio",
          "input_audio": { "data": "{base64_audio_string}", "format": "wav" }
        }
      ]
    }
  ]
}

code princeple:
use typescript

make code simple and clean

use MVC to implement the webapp;
use modules , make sure each module not too big, less than 250 lines


# todo
write a nice .gitignore
init npm project with typescript support, use vite for dev 
build the app, make app   look clean , using minimal style               





