<script lang="ts">
    import { Mic, MessageSquareMore, X } from 'lucide-svelte';
    import { writable } from 'svelte/store';
    import { fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing';
    import { onMount } from 'svelte';

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
    
    // Drag gesture variables
    let startY = 0;
    let currentY = 0;
    let dragging = false;
    let drawerElement: HTMLElement | null = null;
    let drawerHeight = 0;
    let drawerTransform = writable(0);

    const drawerVisible = writable(false);
    const activeButton = writable('none');
    let isInteractingWithForm = false;

    const audioSent = writable(false);

    // Add event listeners for drag on component mount
    onMount(() => {
        // Add passive event listeners for performance
        document.addEventListener('mousemove', handleDrag, { passive: true });
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDrag, { passive: true });
        document.addEventListener('touchend', handleDragEnd);
        
        // Clean up event listeners on component destroy
        return () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDrag);
            document.removeEventListener('touchend', handleDragEnd);
        };
    });
    
    function handleSubmit(event: SubmitEvent) {
        event.preventDefault();
        sendWebhook(event);
    }

    function sendAudioWebhook() {
        audioSent.set(true);
        sendWebhook(new Event('submit'));
        
        // Reset the button after a delay
        setTimeout(() => {
            audioSent.set(false);
            webhookText.set("");
        }, 3000);
    }

    function openMicDrawer() {
        activeButton.set('mic');
        drawerVisible.set(true);
        document.body.classList.add('drawer-open');
        setTimeout(() => {
            if (drawerElement) {
                drawerHeight = drawerElement.offsetHeight;
            }
        }, 50);
    }
    
    function openMessageDrawer() {
        activeButton.set('message');
        drawerVisible.set(true);
        document.body.classList.add('drawer-open');
        setTimeout(() => {
            if (drawerElement) {
                drawerHeight = drawerElement.offsetHeight;
            }
        }, 50); 
    }

    function closeDrawer() {
        drawerVisible.set(false);
        drawerTransform.set(0);

        responseMessage.set("");
        isSuccess.set(false);
        isError.set(false);

        setTimeout(() => {
            document.body.classList.remove('drawer-open');
        }, 300);
    }

    function handleDragStart(event: MouseEvent | TouchEvent) {
        // If we're interacting with form elements, don't start dragging
        if (!drawerElement || isInteractingWithForm) return;
        
        // Don't capture on form elements
        if (event.target instanceof Element) {
            const tagName = event.target.tagName.toLowerCase();
            if (['input', 'textarea', 'button', 'select'].includes(tagName)) {
                return;
            }
        }
        
        dragging = true;
        startY = event.type.includes('mouse') 
            ? (event as MouseEvent).clientY 
            : (event as TouchEvent).touches[0].clientY;
        drawerElement.style.transition = 'none';
    }

    function handleDrag(event: MouseEvent | TouchEvent) {
        if (!dragging || !drawerElement) return;
        
        const clientY = event.type.includes('mouse') 
            ? (event as MouseEvent).clientY 
            : (event as TouchEvent).touches[0].clientY;
        currentY = clientY - startY;
        
        // Only allow dragging down, not up
        if (currentY < 0) currentY = 0;
        
        drawerTransform.set(currentY);
        drawerElement.style.transform = `translateY(${currentY}px)`;
    }

    function handleDragEnd() {
        if (!dragging || !drawerElement) return;
        
        dragging = false;
        drawerElement.style.transition = 'transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)';
        
        // If dragged more than 25% of drawer height, close it
        if (currentY > drawerHeight * 0.25) {
            closeDrawer();
        } else {
            // Otherwise snap back
            drawerTransform.set(0);
            drawerElement.style.transform = '';
        }
    }

    // Handle form element interactions
    function handleFormFocus() {
        isInteractingWithForm = true;
    }
    
    function handleFormBlur() {
        isInteractingWithForm = false;
    }
</script>

<div class="flex justify-center items-center">
    <!-- Mic Button: Blue -->
    <button 
        on:click={openMicDrawer} 
        class="w-24 h-24 bg-blue-500 text-white rounded-l-3xl rounded-r-none shadow-lg 
               hover:bg-blue-600 active:bg-blue-700 active:scale-95 transition-all duration-150"
        aria-label="Activate microphone"
    >
        <Mic size={34} class="block mx-auto" />
    </button>

    <!-- Message Button: Gray -->
    <button 
        on:click={openMessageDrawer} 
        class="w-24 h-24 bg-gray-100 text-black rounded-r-3xl rounded-l-none shadow-lg
               hover:bg-gray-200 active:bg-gray-300 active:scale-95 transition-all duration-150"
        aria-label="Open message input"
    >
        <MessageSquareMore size={34} class="block mx-auto" />
    </button>
</div>

{#if $drawerVisible}
    <!-- Overlay that pushes main content back -->
    <div 
        class="fixed inset-0 bg-black/20 z-40"
        on:click={closeDrawer}
        in:fly={{ duration: 200, opacity: 0 }}
        out:fly={{ duration: 200, opacity: 0 }}
    ></div>

    <div 
        bind:this={drawerElement}
        class="fixed inset-x-0 bottom-0 h-1/2 bg-white shadow-lg rounded-t-3xl z-50 touch-pan-y"
        in:fly={{ y: 500, duration: 300, easing: cubicOut }}
        out:fly={{ y: 500, duration: 300, easing: cubicOut }}
        on:mousedown={handleDragStart}
        on:touchstart={handleDragStart}
    >
        <!-- Drag handle -->
        <div class="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-1 cursor-grab" role="button" aria-label="Drag handle"></div>

        <!-- Header with close button -->
        <div class="flex justify-between items-center p-4 border-b">
            <h3 class="text-lg font-semibold">
                {#if $activeButton === 'mic'}
                    Voice Recording
                {:else if $activeButton === 'message'}
                    Message Input
                {/if}
            </h3>
            <button 
                on:click={closeDrawer}
                class="p-1 hover:bg-gray-100 rounded-full"
                aria-label="Close drawer"
            >
                <X size={24} />
            </button>
        </div>

        <!-- Drawer Content -->
        <div class="p-5 h-[calc(100%-60px)] overflow-y-auto"
            role="region" aria-label="Drawer content"
            on:mousedown|stopPropagation 
            on:touchstart|stopPropagation>

            {#if $activeButton === 'mic'}
                <div class="text-center">
                    <button 
                        type="button"
                        on:click={$isRecording ? stopRecording : startRecording}
                        class={`w-24 h-24 rounded-full mx-auto flex items-center justify-center mb-4 
                            ${$isRecording 
                            ? 'bg-red-500 hover:bg-red-600 text-white' 
                            : 'bg-gray-200 hover:bg-gray-300'}`}
                        aria-pressed={$isRecording}
                    >
                        <Mic size={40} class={$isRecording ? "text-white" : "text-gray-600"} />
                    </button>
                    <p class="mt-2 mb-4">
                        {$isRecording ? 'Aufnahme stoppen' : 'Sprachaufnahme starten'}
                    </p>
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
                                class={`px-4 py-2 ${$audioSent ? 'bg-gray-500' : 'bg-green-500 hover:bg-green-600'} text-white rounded transition-colors duration-300`}
                                disabled={$audioSent}
                            >
                                {$audioSent ? 'Sending...' : 'Aufnahme senden'}
                            </button>
                        </div>
                    {/if}
                    
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
            
            {:else if $activeButton === 'message'}
                <div class="text-center">
                    <form class="flex flex-col sm:flex-row gap-2 mb-6" on:submit={handleSubmit} on:focus={handleFormFocus} on:blur={handleFormBlur}>
                        <input
                            id="webhook-input"
                            placeholder="Type your message here..."
                            bind:value={$webhookText}
                            aria-label="Webhook message text"
                            class="flex-1 px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button 
                            type="submit" 
                            class="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                        >
                            Send Message
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
            {/if}
        </div>
    </div>
{/if}

<style>
    :global(body.drawer-open) {
        overflow: hidden;
    }
    
    :global(body.drawer-open .app-content) {
        transform: scale(0.95) translateY(-5%);
        transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        border-radius: 16px;
        overflow: hidden;
    }
    
    :global(.app-content) {
        transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        transform-origin: center;
    }
</style>