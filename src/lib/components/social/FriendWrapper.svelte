<script lang="ts">
    import { Users, Ticket } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { friends } from '$lib/stores';
    import { initializeFriends, addFriend } from '$lib/friends';
    import { checkForQuestTicket, createQuest } from '$lib/quests';

    let error = $state('');
    
    // Initialization
    onMount(() => {
        Promise.all([
            initializeFriends(),
            checkForQuestTicket()
        ]);
    });

    // Helper functions
    const isFriend = (userId: string) => $friends.friendIds.has(userId);
    const isPending = (userId: string) => $friends.pendingRequests.has(userId);
    
    // Action handlers
    async function handleAddFriend(userId: string) {
        try {
            const result = await addFriend(userId);
            if (!result.success) error = result.error || 'Failed to add friend';
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
        }
    }
</script>

<h3 class="text-2xl text-gray-500 mb-4 pb-2 border-b border-gray-200">Friends</h3>
<div class="space-y-3 mb-8 max-h-92 overflow-y-auto pr-2">
    {#if error}
        <p class="text-center text-red-500">{error}</p>
    {/if}
    
    {#if $friends.loading}
        <p class="text-center text-gray-500">Loading users...</p>
    {:else if $friends.users.length === 0}
        <p class="text-center text-gray-500">No other users found</p>
    {:else}
        <!-- User list -->
        {#each $friends.users as user}
            <div class="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users class="w-5 h-5 text-gray-500" />
                </div>
                <div class="flex-1">
                    <p class="font-medium">{user.displayname}</p>
                    <p class="text-xs text-gray-500">Online now</p>
                </div>
                
                <!-- Friend action buttons -->
                {#await checkForQuestTicket()}
                        <!-- Optional loading state -->
                {:then hasTicket}
                    {#if isFriend(user.user_id) && hasTicket}
                        <button 
                            class="bg-green-500 text-white rounded-full px-3 py-1 text-xs cursor-pointer flex items-center gap-1"
                            onclick={() => createQuest(user.user_id)}
                        >
                            <Ticket size={14} />
                            <span>Quest</span>
                        </button>
                    {:else}
                        <button 
                            class={`${isFriend(user.user_id) ? 'bg-green-500' : 'bg-blue-500'} text-white rounded-full px-3 py-1 text-xs cursor-pointer`}
                            onclick={() => handleAddFriend(user.user_id)}
                            disabled={isFriend(user.user_id) || isPending(user.user_id)}
                        >
                            {isPending(user.user_id) ? '●●●' : (isFriend(user.user_id) ? 'Added' : 'Add')}
                        </button>
                    {/if}
                {/await}
            </div>
        {/each}
    {/if}
</div>