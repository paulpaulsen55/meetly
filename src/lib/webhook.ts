import { writable, get } from 'svelte/store';
import { addEvent } from './helper';
import { n8nServer } from './stores';

interface WebhookResponse {
    message: string;
    success: boolean;
    error?: string;
}

export const responseMessage = writable<string>("");
export const isError = writable<boolean>(false);
export const isSuccess = writable<boolean>(false);

const audioBlob = writable<Blob | null>(null);
const audioChunks = writable<Blob[]>([]);

export async function startRecording(recorder: MediaRecorder) {
    try {
        recorder.onstart = () => {
            audioChunks.set([]);
        };

        recorder.ondataavailable = (event) => {
            audioChunks.update(chunks => [...chunks, event.data]);
        };

        recorder.onstop = () => {
            const blob = new Blob(get(audioChunks), { type: 'audio/webm' });
            audioBlob.set(blob);
        };

        recorder.start();
    } catch (error) {
        console.error("Error accessing microphone:", error);
    }
}

export function stopRecording(recorder: MediaRecorder) {
    recorder.stop();
    recorder.stream.getTracks().forEach(track => track.stop());
    return get(audioBlob);
}

export async function sendWebhook(content: Blob | string): Promise<WebhookResponse> {
    let message = "";
    let success = false;
    let error = undefined;
    
    // Reset status messages
    responseMessage.set("");
    isError.set(false);
    isSuccess.set(false);

    const url = get(n8nServer);

    try {
        const formData = new FormData();

        if (content instanceof Blob) {
            formData.append("audio", content, "recording.webm");
        } else {
            formData.append("message", content);
        }

        const response = await fetch(url, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Webhook request failed with status:", response.status, errorText);
            message = `Failed: ${response.status} ${response.statusText}`;
            error = message;
            isError.set(true);
            responseMessage.set(message);
        } else {
            console.log("Webhook sent successfully");
            const responseData = await response.text();
            message = responseData;
            
            try {
                let parsedData;
                try {
                    const parsed = JSON.parse(responseData);
                    
                    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].output) {
                        parsedData = parsed[0].output;
                    } else {
                        parsedData = parsed;
                    }
                    
                    console.log("Parsed webhook response:", parsedData);

                    const result = await addEvent(parsedData);

                    if (!result.success) {
                        throw new Error(result.error);
                    }
                    
                    success = true;
                    isSuccess.set(true);
                    responseMessage.set("Event added successfully!");                    
                } catch (parseError) {
                    console.error("Error with webhook data:", parseError);
                    error = parseError instanceof Error ? parseError.message : "Failed to process event data";
                    isError.set(true);
                    responseMessage.set(error);
                }
            } catch (dbError) {
                console.error("Error connecting to Supabase:", dbError);
                error = "Database error - couldn't save event";
                isError.set(true);
                responseMessage.set(error);
            }
        }
    } catch (error) {
        console.error("Error sending webhook:", error);
        const errorMsg = error instanceof Error ? error.message : "Error sending webhook";
        isError.set(true);
        responseMessage.set(errorMsg);
    }

    return { message, success, error };
}