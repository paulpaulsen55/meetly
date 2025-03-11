<script lang="ts">
    import { onDestroy } from 'svelte';
    import { userProfile } from '$lib/auth';
    import type { EventData } from '$lib/auth';
    import { Clock, Info } from 'lucide-svelte';

    let events: EventData[] = [];
    const unsubscribe = userProfile.subscribe((value) => {
        events = value?.events ?? [];
    });
    onDestroy(unsubscribe);
</script>

<div class="flex gap-2 mb-4">
    <div class="w-4/5 bg-gray-50 rounded-3xl p-4 flex flex-col">
        <h2 class="text-xl font-semibold mb-2 text-center text-gray-400">Upcoming</h2>
        <div class="border-t border-gray-200 mb-3"></div>
        
        <div class="overflow-y-auto">
            {#if events.length > 0}
                {#each events as event}
                    <div class="flex items-center justify-between py-2">
                        <div class="text-sm"><strong>@{event.date}:</strong> {event.topic}</div>
                    </div>
                {/each}
            {:else}
                <p class="text-sm text-gray-500">No upcoming events</p>
            {/if}
        </div>
    </div>

    <div class="w-1/5 flex flex-col gap-4">
        <div class="h-20 bg-gray-50 rounded-3xl flex items-center justify-center">
            <Info size={45} />
        </div>
        <div class="h-20 bg-gray-50 rounded-3xl flex items-center justify-center">
            <Clock size={45} />
        </div>
    </div>
</div>