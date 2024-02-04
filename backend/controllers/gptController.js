import OpenAI from "openai";
import { OPENAI_API_KEY } from "../appsecrets.js";
import base64 from 'base-64';
import fs from 'fs';


function encode_image(image_path) {
  const imageFile = fs.readFileSync(image_path);
  return imageFile.toString('base64');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});

export async function getUser(filePath) {
  const base64_image = encode_image(filePath)

  const response = await openai.chat.completions.create({
    model: "gpt-4-vision-preview",
    messages: [
      {
        role: "user", 
        content: [
          { type: "text", text: "What’s in this image?" },
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
  console.log(response.choices[0]);
}
