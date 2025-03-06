<script lang="ts">
    import { Mic, MessageSquareMore, X } from 'lucide-svelte';
    import { writable } from 'svelte/store'; // Ensure this import is present
    import { fly } from 'svelte/transition';
    import { cubicOut } from 'svelte/easing'; // Removed elasticOut as it's not used
    import { onMount } from 'svelte';

    // Drawer visibility state
    const drawerVisible = writable(false);
    const activeButton = writable('none');

    // Drag gesture variables
    let startY = 0;
    let currentY = 0;
    let dragging = false;
    let drawerElement: HTMLElement | null = null;
    let drawerHeight = 0;
    let drawerTransform = writable(0);

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
    } // Added missing closing brace here

    function closeDrawer() {
        drawerVisible.set(false);
        drawerTransform.set(0);
        setTimeout(() => {
            document.body.classList.remove('drawer-open');
        }, 300);
    }

    // Fixed TypeScript errors in event handlers
    function handleDragStart(event: MouseEvent | TouchEvent) {
        if (!drawerElement) return;
        
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

    // Add event listeners for drag on component mount
    onMount(() => {
        // Clean up event listeners on component destroy
        return () => {
            document.removeEventListener('mousemove', handleDrag);
            document.removeEventListener('mouseup', handleDragEnd);
            document.removeEventListener('touchmove', handleDrag);
            document.removeEventListener('touchend', handleDragEnd);
        };
    });

    // Add global event listeners when dragging starts
    function addDragListeners() {
        document.addEventListener('mousemove', handleDrag);
        document.addEventListener('mouseup', handleDragEnd);
        document.addEventListener('touchmove', handleDrag);
        document.addEventListener('touchend', handleDragEnd);
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
        on:mousedown={(e) => { handleDragStart(e); addDragListeners(); }}
        on:touchstart={(e) => { handleDragStart(e); addDragListeners(); }}
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
                {:else}
                    Action
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
                    <div class="w-24 h-24 rounded-full bg-red-500 mx-auto flex items-center justify-center mb-4">
                        <Mic size={40} class="text-white" />
                    </div>
                    <p>Voice recording activated</p>
                    <button class="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Start Recording
                    </button>
                </div>
            {:else if $activeButton === 'message'}
                <div>
                    <textarea 
                        class="w-full border rounded-lg p-3 h-32 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Type your message here..."
                    ></textarea>
                    <button class="mt-4 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600">
                        Send Message
                    </button>
                </div>
            {:else}
                <p>Select an action</p>
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