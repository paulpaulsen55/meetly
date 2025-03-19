<script lang="ts">
    import { onDestroy } from 'svelte';
    import { Clock, Info, SquareArrowOutUpRight, Plus } from 'lucide-svelte';
    import { userProfile } from '$lib/auth';
    import type { EventData } from '$lib/auth';
    import Drawer from './Drawer.svelte';
    import DrawerEventInput from './DrawerEventInput.svelte';
    import { formatDate } from '$lib/date';

    let events = $state<EventData[]>([]);
    let isEventDrawerOpen = $state(false);
    
    const unsubscribe = userProfile.subscribe((value) => {
        events = value?.events ?? [];
    });
    onDestroy(unsubscribe);
    
    function openEventDrawer() {
        isEventDrawerOpen = true;
    }
    
    function closeEventDrawer() {
        isEventDrawerOpen = false;
    }
</script>

<div class="flex gap-2 mb-4">
    <div class="w-4/5 bg-gray-50 rounded-3xl p-4 flex flex-col">
        <h2 class="text-2xl font-bold mb-2 text-center">Upcoming</h2>
        <div class="border-t border-gray-300 mb-3"></div>
        
        <div class="flex-1 overflow-y-auto min-h-0 max-h-64 pr-4" style="scrollbar-gutter: stable;">
            {#if events.length > 0}
                {#each events as event}
                    <div class="flex items-center mb-2">
                        <div class="flex py-1 bg-gray-100 rounded-3xl px-2 w-full">
                            <div>
                                <!-- Use formatDate to display friendly date format -->
                                <span class="text-gray-400">@{formatDate(event.date)}:</span>
                                <span class="text-md">{event.title}</span>
                            </div>
                        </div>
                        <SquareArrowOutUpRight size={18} class="text-black hover:text-blue-500 cursor-pointer flex-shrink-0 ml-4" />
                    </div>
                {/each}
            {/if}
            <button 
                type="button" 
                class="flex py-1 rounded-3xl px-2 w-full cursor-pointer hover:bg-gray-100" 
                onclick={openEventDrawer} 
                aria-label="Add Event"
            >
                <div class="flex items-center">
                    <Plus size={18} class="text-black mr-2"/> 
                    <span class="text-md">add Event</span>
                </div>
            </button>
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
    
    <!-- Listen for the drawer's close event -->
    <Drawer 
        isOpen={isEventDrawerOpen}
        on:close={closeEventDrawer}
    >
        {#snippet button()}
            <div></div>
        {/snippet}
        
        {#snippet title()}
            Add Event
        {/snippet}
        
        <DrawerEventInput />
    </Drawer>
</div>