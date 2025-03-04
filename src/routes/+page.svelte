<script lang="ts">
    let webhookText = $state("");
    let responseMessage = $state("");
    let isSuccess = $state(false);
    let isError = $state(false);
    
    // Audio recording states
    let mediaRecorder = $state(null);
    let audioChunks = $state([]);
    let isRecording = $state(false);
    let audioBlob = $state(null);
    let audioUrl = $state("");

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioChunks = [];
            mediaRecorder = new MediaRecorder(stream);
            
            mediaRecorder.ondataavailable = (event) => {
                audioChunks = [...audioChunks, event.data];
            };
            
            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                audioUrl = URL.createObjectURL(audioBlob);
                webhookText = "Audio aufgenommen und bereit zum Senden";
            };
            
            mediaRecorder.start();
            isRecording = true;
        } catch (error) {
            console.error("Error accessing microphone:", error);
            responseMessage = `Mikrofon-Zugriffsfehler: ${error.message}`;
            isError = true;
        }
    }
    
    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            // Close audio tracks to release microphone
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
        }
    }

    async function sendWebhook(event: Event) {
        event.preventDefault();
        const url = "http://localhost:5678/webhook-test/981ad22c-97a6-4f32-a0d9-c8e70cebcdb4";
        responseMessage = "";
        isSuccess = false;
        isError = false;
        
        try {
            let formData = new FormData();
            formData.append("sessionId", "94mb1kt8np");
            
            if (audioBlob) {
                console.log("Sending audio data...");
                
                formData.append("audio", audioBlob, "recording.webm");
            } else {
                formData.append("message", webhookText);
            }
            
            const response = await fetch(url, {
                method: "POST",
                body: formData
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error("Webhook request failed with status:", response.status, errorText);
                responseMessage = `Failed: ${response.status} ${response.statusText}`;
                isError = true;
            } else {
                console.log("Webhook sent successfully");
                responseMessage = await response.text();
                isSuccess = true;
                // Reset audio data after sending
                audioBlob = null;
                audioUrl = "";
            }
        } catch (error) {
            console.error("Error sending webhook:", error);
            responseMessage = `Error: ${error.message}`;
            isError = true;
        }
    }
</script>

<main class="container">
    <h1>meetly.enis</h1>

    <!-- Webhook textbox form -->
    <form class="row" onsubmit={sendWebhook}>
        <input
            id="webhook-input"
            placeholder="Enter text for webhook..."
            bind:value={webhookText}
        />
        <button type="submit">Send Webhook</button>
    </form>
    
    <!-- Audio recording controls -->
    <div class="audio-controls">
        <button 
            type="button" 
            onclick={isRecording ? stopRecording : startRecording}
            class={isRecording ? 'recording' : ''}
        >
            {isRecording ? 'Aufnahme stoppen' : 'Sprachaufnahme starten'}
        </button>
        
        {#if audioUrl}
            <div class="audio-preview">
                <audio controls src={audioUrl}></audio>
                <button type="button" onclick={() => sendWebhook(new Event('submit'))}>
                    Aufnahme senden
                </button>
            </div>
        {/if}
    </div>
    
    {#if responseMessage}
        <div class="response-message {isSuccess ? 'success' : ''} {isError ? 'error' : ''}">
            {responseMessage}
        </div>
    {/if}
</main>

<style>
    .response-message {
        margin-top: 1rem;
        padding: 0.5rem;
        border-radius: 4px;
    }
    
    .success {
        background-color: #d4edda;
        color: #155724;
        border: 1px solid #c3e6cb;
    }
    
    .error {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
    }
    
    .audio-controls {
        margin-top: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
    
    .audio-preview {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 0.5rem;
    }
    
    button.recording {
        background-color: #f44336;
        color: white;
    }
    
    @media (prefers-color-scheme: dark) {
        .success {
            background-color: #1e4a30;
            color: #d4edda;
        }
        
        .error {
            background-color: #4a1e1e;
            color: #f8d7da;
        }
    }
</style>