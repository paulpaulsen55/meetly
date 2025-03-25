<script lang="ts">
    import { onDestroy } from 'svelte';
    import { SquareArrowOutUpRight, Plus } from 'lucide-svelte';
    import { userProfile } from '$lib/auth';
    import type { EventData } from '$lib/auth';
    import { loadProfile } from '$lib/helper';
    import { formatDate, parseDate } from '$lib/date';
    import { sendWebhook } from "$lib/webhook";

    let events = $state<EventData[]>([]);
    let newEventText = $state("");
    let loading = $state(false);
    
    const unsubscribe = userProfile.subscribe((value) => {
        if (value?.events) {
            // Get current date (without time)
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            // Filter out past events and sort by date
            events = value.events
                .filter(event => {
                    const eventDate = parseDate(event.date);
                    return eventDate && eventDate >= today;
                })
                .sort((a, b) => {
                    const dateA = parseDate(a.date) || new Date();
                    const dateB = parseDate(b.date) || new Date();
                    return dateA.getTime() - dateB.getTime();
                });
        } else {
            events = [];
        }
    });
    onDestroy(unsubscribe);

    async function handleAddEvent() {
        if (!newEventText.trim()) return;
        
        loading = true;
        try {
            const result = await sendWebhook(newEventText);
            
            if (result && result.success) {
                await loadProfile();
            }
            
            newEventText = "";
        } catch (error) {
            console.error("Error adding event:", error);
        } finally {
            loading = false;
        }
    }
</script>

<div class="flex gap-2">
    <div class="w-full bg-gray-50 border border-gray-200 rounded-3xl p-4">
        <h2 class="text-2xl text-gray-500 border-b border-gray-200 pb-1">Upcoming</h2>

        <!-- Add new event -->
        <div class="flex-1 overflow-y-auto min-h-0 max-h-68 pr-4" style="scrollbar-gutter: stable;">
            <div class="mt-3 mb-3 p-1">
                <div class="flex gap-2">
                    <input
                        type="text"
                        placeholder="Add new event ..."
                        bind:value={newEventText}
                        class="flex-grow bg-white border border-gray-300 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={loading}
                    />
                    <button 
                        class={`rounded-full w-12 h-12 flex items-center justify-center cursor-pointer ${loading ? "bg-gray-400" : "bg-blue-500 hover:bg-blue-600"} text-white`}
                        onclick={handleAddEvent}
                        disabled={loading}
                    >
                        <Plus size="25" />
                    </button>
                </div>
            </div>
            
            <!-- Events -->
            {#if events.length > 0}
                {#each events as event}
                    <div class="space-y-3 mb-3">
                        <div class="flex items-center justify-between">
                            <div class="bg-gray-200 rounded-full py-2 px-4 flex-grow mr-2">
                            <p>
                                <span class="text-gray-500">@{formatDate(event.date)}:</span> {event.title}
                            </p>
                            </div>
                            <SquareArrowOutUpRight size="20" class="hover:text-blue-500 cursor-pointer" />
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</div>