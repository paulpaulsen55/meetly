<script lang="ts">
    import { sendWebhook } from "$lib/webhook";
    import { responseMessage, isError, isSuccess } from "$lib/webhook";

    let webhookText = $state("");
    let loading = $state(false);

    async function handleSubmit(event: Event) {
        event.preventDefault();
        loading = true;

        await sendWebhook(webhookText).finally(() => {
            loading = false;
        });
    }
</script>

<div class="text-center">
    <form
        class="flex flex-col sm:flex-row gap-2 mb-6"
        onsubmit={handleSubmit}
    >
        <input
            id="webhook-input"
            placeholder="Type your message here..."
            bind:value={webhookText}
            aria-label="Webhook message text"
            class="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={loading}
        />
        <button
            type="submit"
            class={`px-4 py-2 cursor-pointer ${loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"} text-white rounded-lg transition-colors duration-300`}
            disabled={loading}
        >
            {loading ? "Sending..." : "Send Message"}
        </button>
    </form>

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
</div>