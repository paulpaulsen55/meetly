import { writable, get } from 'svelte/store';
import { supabase } from './supabase';
import { n8nServer } from './stores';

interface WebhookResponse {
    message: string;
    success: boolean;
}

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
                        parsedData = JSON.parse(responseData);
                    }
                    
                    console.log("Parsed webhook response:", parsedData);
                } catch (parseError) {
                    console.error("Error parsing webhook response:", parseError);
                    parsedData = { error: "Failed to parse response", original: responseData };
                }
                
                const { error } = await supabase
                    .from('user_events')
                    .insert({
                        event: parsedData
                    });
                
                if (error) {
                    console.error("Error saving event to Supabase:", error);
                } else {
                    success = true;
                    console.log("Event saved to Supabase successfully");
                }
            } catch (dbError) {
                console.error("Error connecting to Supabase:", dbError);
            }
        }
    } catch (error) {
        console.error("Error sending webhook:", error);
    }

    return { message, success };
}