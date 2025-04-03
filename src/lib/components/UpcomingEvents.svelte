<script lang="ts">
    import { onDestroy } from 'svelte';
    import { CircleCheck, Plus } from 'lucide-svelte';
    import { userProfile } from '$lib/stores';
    import type { EventData } from '$lib/stores';
    import { loadProfile } from '$lib/helper';
    import { formatDate, parseDate } from '$lib/date';
    import { sendWebhook } from "$lib/webhook";
    import { supabase } from '$lib/supabase';

    let events = $state<EventData[]>([]);
    let newEventText = $state("");
    let loading = $state(false);
    let isComplete = $state(false);
    
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

    function isToday(dateString: string): boolean {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const eventDate = parseDate(dateString);
        if (!eventDate) return false;

        eventDate.setHours(0, 0, 0, 0);
        return eventDate.getTime() === today.getTime();
    }

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

    async function confirmEvent(event: EventData) {
        try {            
            const { data, error: rpcError } = await supabase.rpc('confirm_event', {
                event_title: event.title,
                event_date: event.date
            });
            if (rpcError) throw rpcError;

            await loadProfile();

            return data;
        } catch (error) {
            console.error("Error confirming event:", error);
        }
    }
</script>

<div class="h-full flex">
    <div class="w-full bg-gray-50 border border-gray-200 rounded-3xl p-4 flex flex-col">
        <h2 class="text-2xl text-gray-500 border-b border-gray-200 pb-1 flex-none">Upcoming</h2>

        <!-- Add new event -->
        <div class="mt-3 pb-3 flex-none">
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
        
        <!-- Events list (scrollable) -->
        <div class="flex-grow overflow-y-auto pr-2" style="scrollbar-gutter: stable; min-height: 0;">
            {#if events.length > 0}
                {#each events as event}
                    <div class="mb-3">
                        <div class="flex items-center justify-between">
                            <div class="bg-gray-200 rounded-full py-2 px-4 flex-grow mr-2">
                                <p>
                                    <span class="text-gray-500">@{formatDate(event.date)}:</span> {event.title}
                                </p>
                            </div>
                            {#if isToday(event.date) && event.is_complete == false}
                                <button 
                                    onclick={() => confirmEvent(event)} 
                                    class="text-green-500 hover:text-green-600 cursor-pointer"
                                    >
                                    <CircleCheck size="20" class="cursor-pointer" />
                                </button>
                            {:else}
                                <button 
                                    disabled={true}
                                    class="text-gray-300 cursor-not-allowed"
                                >
                                    <CircleCheck size="20" />
                                </button>
                            {/if}
                        </div>
                    </div>
                {/each}
            {/if}
        </div>
    </div>
</div>