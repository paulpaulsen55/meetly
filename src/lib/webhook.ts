import { writable, get } from 'svelte/store';
import { supabase } from './supabase';
import { loadProfile } from './helper';
import { parseDate, formatISODate } from './date';

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

    const url = "http://localhost:5678/webhook/981ad22c-97a6-4f32-a0d9-c8e70cebcdb4";

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
                    
                    // Validate the date
                    if (!parsedData.date) {
                        throw new Error("No date found in event");
                    }
                    
                    const parsedDate = parseDate(parsedData.date);
                    if (!parsedDate) {
                        throw new Error(`Invalid date format: ${parsedData.date}`);
                    }
                    
                    // Convert to ISO format (YYYY-MM-DD)
                    parsedData.date = formatISODate(parsedDate);
                    
                    // Save validated event to database
                    const { error: dbError } = await supabase
                        .from('user_events')
                        .insert({
                            event: parsedData
                        });
                    
                    if (dbError) {
                        throw dbError;
                    }
                    
                    success = true;
                    isSuccess.set(true);
                    responseMessage.set("Event added successfully!");
                    
                    await loadProfile();
                    
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