<script lang="ts">
    import { Users, Ticket } from 'lucide-svelte';
    import { addFriend } from '$lib/friends';
    import { createQuest } from '$lib/quests';
    import {invalidate} from '$app/navigation';

    let { users, hasTicket } = $props();
    let error = $state('');

    async function handleAddFriend(userId: string) {
        try {
            await addFriend(userId);
            invalidate('app:friends');
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
        }
    }

    async function handleCreateQuest(userId: string) {
        try {
            await createQuest(userId);
            invalidate('app:quests');
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
        }
    }
</script>

<h3 class="text-2xl text-gray-500 mb-4 pb-2 border-b border-gray-200">Friends</h3>
<div class="space-y-3 mb-8 max-h-92 sm:max-h-64 overflow-y-auto pr-2">
    {#if error}
        <p class="text-center text-red-500">{error}</p>
    {/if}

    {#each users as user}
        <div class="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
            <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Users class="w-5 h-5 text-gray-500" />
            </div>
            <div class="flex-1">
                <p class="font-medium">{user.displayname}</p>
                <p class="text-xs text-gray-500">Online now</p>
            </div>
            
            <!-- Friend action buttons -->
            {#if user.is_friend && hasTicket}
                <button
                    class="bg-green-500 text-white rounded-full px-3 py-1 text-xs cursor-pointer flex items-center gap-1"
                    onclick={() => handleCreateQuest(user.user_id)}
                >
                    <Ticket size={14} />
                    <span>Quest</span>
                </button>
            {:else}
                <button 
                    class={`${user.is_friend ? 'bg-green-500' : 'bg-blue-500'} text-white rounded-full px-3 py-1 text-xs cursor-pointer`}
                    onclick={() => handleAddFriend(user.user_id)}
                    disabled={user.is_friend}
                >
                    {user.is_friend ? 'Added' : 'Add'}
                </button>
            {/if}
        </div>
    {:else}
        <p class="text-center text-gray-500">No other users found</p>
    {/each}
</div>