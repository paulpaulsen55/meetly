<script lang="ts">
    import { sendWebhook, startRecording, stopRecording } from "$lib/webhook";
    import { Mic } from "lucide-svelte";
    
    let mediaRecorder: MediaRecorder | null = $state(null);
    let loading = $state(false);
    let isRecording = $state(false);
    let audioUrl = $state("");
    let audioBlob: Blob | null = $state(null);
    let error = $state("");
    let permissionDenied = $state(false);

    async function checkMicrophonePermission() {
        try {
            // Try to get user media to test permissions
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            // If successful, immediately stop all tracks
            stream.getTracks().forEach(track => track.stop());
            permissionDenied = false;
            return true;
        } catch (err) {
            console.error("Microphone permission error:", err);
            permissionDenied = true;
            error = "Microphone access denied. Please grant permission in your device settings.";
            return false;
        }
    }

    function sendAudioWebhook() {
        if (!audioBlob) {
            error = "No audio recording available to send";
            return;
        }

        error = ""; // Clear any previous errors
        loading = true;
        sendWebhook(audioBlob)
            .then(response => {
                if (!response.success) {
                    error = "Failed to send audio recording";
                }
            })
            .catch(e => {
                error = "Error while sending: " + e.message;
            })
            .finally(() => {
                loading = false;
            });
    }

    async function start(){
        try {
            // First check if we have permission
            const hasPermission = await checkMicrophonePermission();
            if (!hasPermission) return;
            
            error = ""; // Clear any previous errors
            isRecording = true;
            
            // Check if mediaDevices is available
            if (!navigator.mediaDevices) {
                throw new Error("Audio recording is not supported in this browser or context");
            }
            
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder = new MediaRecorder(stream);

            // Reset audio values when starting new recording
            if (audioUrl) {
                URL.revokeObjectURL(audioUrl);
            }
            audioUrl = "";
            audioBlob = null;
            
            startRecording(mediaRecorder);
        } catch (err) {
            console.error("Error starting recording:", err);
            error = err instanceof Error ? err.message : "Failed to start recording";
            isRecording = false;
        }
    }

    async function stop(){
        isRecording = false;
        
        if (mediaRecorder) {
            try {
                const blob = await stopRecording(mediaRecorder);
                
                if (!blob) {
                    error = "Failed to create recording";
                    return;
                }

                // Store the blob directly in our component state
                audioBlob = blob;
                
                // Create a new URL from the current blob
                audioUrl = URL.createObjectURL(blob);
            } catch (err) {
                console.error("Error stopping recording:", err);
                error = err instanceof Error ? err.message : "Failed to stop recording";
            }
        } else {
            console.error("No media recorder found");
            error = "No active recording to stop";
        }
    }

    // Check for permission on component initialization
    checkMicrophonePermission();
</script>

<div class="text-center">
    {#if error}
        <div class="mb-4 p-3 bg-red-100 text-red-800 border border-red-200 rounded">
            {error}
        </div>
    {/if}
    
    <button
        type="button"
        onclick={isRecording ? stop : start}
        class={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 cursor-pointer 
            ${
                isRecording
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gray-200 hover:bg-gray-300"
            }`}
        aria-pressed={isRecording}
    >
        <Mic
            size={40}
            class={isRecording ? "text-white" : "text-gray-600"}
        />
    </button>
    <p class="mt-2 mb-4">
        {isRecording
            ? "Aufnahme stoppen"
            : "Sprachaufnahme starten"}
    </p>
    {#if audioUrl}
        <div class="flex flex-col gap-2 mt-2">
            <audio
                controls
                src={audioUrl}
                preload="metadata"
                class="w-full"
            ></audio>
            <button
                type="button"
                onclick={sendAudioWebhook}
                class={`px-4 py-2 cursor-pointer ${loading ? "bg-gray-500" : "bg-green-500 hover:bg-green-600"} text-white rounded transition-colors duration-300`}
                disabled={loading}
            >
                {loading ? "Sending..." : "Aufnahme senden"}
            </button>
        </div>
    {/if}
</div>