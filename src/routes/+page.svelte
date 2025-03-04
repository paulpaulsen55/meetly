<script lang="ts">
    import { 
        webhookText, 
        sendWebhook, 
        responseMessage, 
        isSuccess, 
        isError, 
        audioUrl, 
        isRecording, 
        startRecording, 
        stopRecording 
    } from '$lib/webhook';
    
    // Event handlers remain similar
    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        sendWebhook(event);
    }

    // Handler for audio submission
    function sendAudioWebhook() {
        sendWebhook(new Event('submit'));
    }
</script>

<main class="container mx-auto px-4 py-8 max-w-2xl">
    <h1 class="text-3xl font-bold mb-6">meetly.enis</h1>

    <!-- Webhook textbox form with proper event handling -->
    <form class="flex flex-col sm:flex-row gap-2 mb-6" on:submit={handleSubmit}>
        <input
            id="webhook-input"
            placeholder="Enter text for webhook..."
            bind:value={$webhookText}
            aria-label="Webhook message text"
            class="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button 
            type="submit" 
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
        >
            Send Webhook
        </button>
    </form>
    
    <!-- Audio recording controls with improved accessibility -->
    <div class="flex flex-col gap-2 mb-6">
        <button 
            type="button" 
            on:click={$isRecording ? stopRecording : startRecording}
            class={`px-4 py-2 rounded transition-colors ${
                $isRecording 
                ? 'bg-red-500 hover:bg-red-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600'
            }`}
            aria-pressed={$isRecording}
        >
            {$isRecording ? 'Aufnahme stoppen' : 'Sprachaufnahme starten'}
        </button>
        
        {#if $audioUrl}
            <div class="flex flex-col gap-2 mt-2">
                <audio 
                    controls 
                    src={$audioUrl} 
                    preload="metadata"
                    class="w-full"
                ></audio>
                <button 
                    type="button" 
                    on:click={sendAudioWebhook}
                    class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                    Aufnahme senden
                </button>
            </div>
        {/if}
    </div>
    
    <!-- Response message with ARIA live region for accessibility -->
    {#if $responseMessage}
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
    {/if}
</main>