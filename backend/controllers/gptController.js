import OpenAI from "openai";
import { OPENAI_API_KEY } from "../appsecrets.js";
import fs from 'fs';
import Tesseract from 'tesseract.js';
import { extractImageText, responsePrompt } from './prompts.js';

function encode_image(image_path) {
  const imageFile = fs.readFileSync(image_path);
  return imageFile.toString('base64');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function processImageText(filePath) {
  return Tesseract.recognize(
    filePath,
    'eng',
    { logger: m => console.log(m) }
  ).then(function(result) {
    return result.data.text;
  });
}

export async function getOpeningLineWithGpt(profileText) {
  const response = await openai.chat.completions.create({
    model: "gpt-4-0125-preview",
    messages: [
      { "role": "system", "content": responsePrompt },
      { "role": "user", "content": 'generate an opening line from :' + profileText }
    ]
  })
  return response.choices[0].message.content;
}

export async function extractBioWithGpt(rawText) {
  const response = await openai.chat.completions.create({
    model: "gpt-3.5-turbo-0125",
    // response_format={ "type": "json_object" },
    messages: [
      { "role": "system", "content": extractImageText },
      { "role": "user", "content": rawText }
    ]
  })
  return response.choices[0].message.content;
}

export async function promptGptVision(filePath) {
  const base64_image = encode_image(filePath)

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user", 
        content: [
          { type: "text", text: "What is in this image?" },
          {
            type: "image_url",
            image_url: {
              "url": `data:image/jpeg;base64, ${base64_image}`,
            },
          },
        ],
      },
    ],
  });
  console.log("🚀 ~ getUser ~ response:", response.choices[0]);
}
