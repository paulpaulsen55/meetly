<script lang="ts">
    let webhookText = $state("");
    let responseMessage = $state("");
    let isSuccess = $state(false);
    let isError = $state(false);

    async function sendWebhook(event: Event) {
        event.preventDefault();
        const url = "http://localhost:5678/webhook/981ad22c-97a6-4f32-a0d9-c8e70cebcdb4";
        responseMessage = "";
        isSuccess = false;
        isError = false;
        
        try {
            const response = await fetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ contactMessage: webhookText, sessionId: "94mb1kt8np" })
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