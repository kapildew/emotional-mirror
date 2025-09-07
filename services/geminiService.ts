import { GoogleGenAI, Modality } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const emotionDetectionModel = 'gemini-2.5-flash';
const textGenerationModel = 'gemini-2.5-flash';
const imageEditingModel = 'gemini-2.5-flash-image-preview';

export async function detectEmotion(base64Image: string, mimeType: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: emotionDetectionModel,
            contents: {
                parts: [
                    {
                        inlineData: {
                            mimeType: mimeType,
                            data: base64Image,
                        },
                    },
                    {
                        text: 'Analyze the primary emotion of the person in this image. Respond with a single, clear emotion word (e.g., Joy, Sadness, Surprise).',
                    },
                ],
            },
            config: {
                thinkingConfig: { thinkingBudget: 0 }
            }
        });
        
        const text = response.text.trim().replace(/[^a-zA-Z]/g, ""); // Clean up response to be a single word
        if (!text) throw new Error("Emotion detection failed to return a valid emotion.");

        return text;
    } catch (error) {
        console.error("Error in detectEmotion:", error);
        throw new Error("Failed to detect emotion from the image.");
    }
}

export async function generateAffirmation(emotion: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: textGenerationModel,
            contents: `Write a short, powerful, poetic affirmation for someone feeling ${emotion}. The tone should be empowering and transformative.`,
            config: {
                systemInstruction: "You are a poetic and wise guide. You reframe emotions into strengths."
            }
        });
        return response.text.trim();
    } catch (error) {
        console.error("Error in generateAffirmation:", error);
        throw new Error("Failed to generate an empowering affirmation.");
    }
}

export async function generateInspiringArt(base64Image: string, emotion: string, affirmation: string, mimeType: string): Promise<string> {
    try {
        const prompt = `Taking inspiration from the emotion "${emotion}" and the affirmation "${affirmation}", transform this photo into an inspiring and artistic piece. Enhance the person's image with surreal, beautiful, and empowering visual elements that reflect their inner strength. The person should remain the focus, but the background and atmosphere should be dreamlike and motivational.`;

        const response = await ai.models.generateContent({
            model: imageEditingModel,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Image,
                            mimeType: mimeType,
                        },
                    },
                    {
                        text: prompt,
                    },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE, Modality.TEXT],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const responseMimeType = part.inlineData.mimeType;
                return `data:${responseMimeType};base64,${base64ImageBytes}`;
            }
        }

        throw new Error("Image editing model did not return an image.");
    } catch (error) {
        console.error("Error in generateInspiringArt:", error);
        throw new Error("Failed to generate inspiring art from the image.");
    }
}