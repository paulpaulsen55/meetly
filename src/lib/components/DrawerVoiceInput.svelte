<script lang="ts">
    import { sendWebhook, startRecording, stopRecording } from "$lib/webhook";
    import { Mic } from "lucide-svelte";
    
    let mediaRecorder: MediaRecorder | null = $state(null);
    let loading = $state(false);
    let isRecording = $state(false);
    let audioUrl = $state("");
    let audioBlob: Blob | null = $state(null);

    function sendAudioWebhook() {
        if (!audioBlob) return;

        loading = true;
        sendWebhook(audioBlob).finally(() => {
            loading = false;
        });
    }

    async function start(){
        isRecording = true;
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);

        startRecording(mediaRecorder)
    }

    async function stop(){
        isRecording = false;
        
        if (mediaRecorder) {
            const blob = stopRecording(mediaRecorder);
            
            if (!blob) return;

            audioUrl = URL.createObjectURL(blob);
        } else{
            console.error("No media recorder found");
        }
    }

</script>

<div class="text-center">
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

    <!-- {#if responseMessage}
        <div 
            class={`mt-4 p-3 rounded border ${
                $isSuccess 
                ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-100 dark:border-green-800' 
                : $isError 
                ? 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-100 dark:border-red-800'
                : 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-100'
            }`}
            role="status"
            aria-live="polite"
        >
            {$responseMessage}
        </div>
    {/if} -->
</div>