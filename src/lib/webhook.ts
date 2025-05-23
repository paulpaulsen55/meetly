import { writable, get } from 'svelte/store';
import { supabase } from './supabase';
import { n8nServer } from './stores';
import { loadProfile } from './helper';

interface WebhookResponse {
    message: string;
    success: boolean;
}

const audioBlob = writable<Blob | null>(null);
const audioChunks = writable<Blob[]>([]);

export async function startRecording(recorder: MediaRecorder) {
    try {
        audioChunks.set([]);
        audioBlob.set(null);

        recorder.onstart = () => {
            audioChunks.set([]);
        };

        recorder.ondataavailable = (event) => {
            audioChunks.update(chunks => [...chunks, event.data]);
        };

        recorder.onstop = () => {
            const chunks = get(audioChunks);
            const blob = new Blob(chunks, { type: 'audio/webm' });
            audioBlob.set(blob);
        };

        recorder.start();
    } catch (error) {
        console.error("Error accessing microphone:", error);
    }
}

export function stopRecording(recorder: MediaRecorder): Promise<Blob | null> {
    return new Promise((resolve) => {
        const stopHandler = () => {
            setTimeout(() => {
                resolve(get(audioBlob));
            }, 100);
            
            recorder.removeEventListener('stop', stopHandler);
        };
        
        recorder.addEventListener('stop', stopHandler);
        
        recorder.stop();
        recorder.stream.getTracks().forEach(track => track.stop());
    });
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
                
                if (responseData && responseData.trim()) {
                    try {
                        const parsed = JSON.parse(responseData);
                        
                        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].output) {
                            parsedData = parsed[0].output;
                        } else {
                            parsedData = parsed;
                        }
                        
                        console.log("Parsed webhook response:", parsedData);
                    } catch (parseError) {
                        console.error("Error parsing webhook response:", parseError);
                        parsedData = { error: "Failed to parse response", original: responseData };
                    }
                } else {
                    console.log("Empty response from webhook");
                    parsedData = { message: "Empty response" };
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
                    await loadProfile();
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