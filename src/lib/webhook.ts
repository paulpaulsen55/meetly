import { writable, get } from 'svelte/store';

// State variables - with proper exports and types
export const webhookText = writable<string>("");
export const responseMessage = writable<string>("");
export const isSuccess = writable<boolean>(false);
export const isError = writable<boolean>(false);

// Audio recording states with proper types
export const mediaRecorder = writable<MediaRecorder | null>(null);
export const audioChunks = writable<Blob[]>([]);
export const isRecording = writable<boolean>(false);
export const audioBlob = writable<Blob | null>(null);
export const audioUrl = writable<string>("");

export async function startRecording() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        audioChunks.set([]);
        const recorder = new MediaRecorder(stream);
        mediaRecorder.set(recorder);

        recorder.ondataavailable = (event) => {
            audioChunks.update(chunks => [...chunks, event.data]);
        };

        recorder.onstop = () => {
            const chunks = get(audioChunks);
            const blob = new Blob(chunks, { type: 'audio/webm' });
            audioBlob.set(blob);
            audioUrl.set(URL.createObjectURL(blob));
            webhookText.set("Audio aufgenommen und bereit zum Senden");
        };

        recorder.start();
        isRecording.set(true);
    } catch (error) {
        console.error("Error accessing microphone:", error);
        if (error instanceof Error) {
            responseMessage.set(`Mikrofon-Zugriffsfehler: ${error.message}`);
        } else {
            responseMessage.set("Mikrofon-Zugriffsfehler: Unbekannter Fehler");
        }
        isError.set(true);
    }
}

export function stopRecording() {
    mediaRecorder.update(recorder => {
        if (recorder && isRecording) {
            recorder.stop();
            isRecording.set(false);
            // Close audio tracks to release microphone
            recorder.stream.getTracks().forEach(track => track.stop());
        }
        return recorder;
    });
}

export async function sendWebhook(event: Event) {
    event.preventDefault();
    const url = "http://localhost:5678/webhook/981ad22c-97a6-4f32-a0d9-c8e70cebcdb4";
    responseMessage.set("");
    isSuccess.set(false);
    isError.set(false);

    try {
        const formData = new FormData();
        formData.append("sessionId", "94mb1kt8np");

        const blob = get(audioBlob);
        const text = get(webhookText);

        if (blob) {
            console.log("Sending audio data...");
            formData.append("audio", blob, "recording.webm");
        } else {
            formData.append("message", text);
        }

        const response = await fetch(url, {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Webhook request failed with status:", response.status, errorText);
            responseMessage.set(`Failed: ${response.status} ${response.statusText}`);
            isError.set(true);
        } else {
            console.log("Webhook sent successfully");
            const responseText = await response.text();
            responseMessage.set(responseText);
            isSuccess.set(true);
            // Reset audio data after sending
            audioBlob.set(null);
            audioUrl.set("");
        }
    } catch (error) {
        console.error("Error sending webhook:", error);
        if (error instanceof Error) {
            responseMessage.set(`Error: ${error.message}`);
        } else {
            responseMessage.set("Error: Unknown error");
        }
        isError.set(true);
    }
}