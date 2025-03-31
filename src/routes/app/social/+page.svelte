<script lang="ts">
    import { Plus, Users, UserCheck } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { friends } from '$lib/stores';
    import { initializeFriends, addFriend } from '$lib/friends';

    let error = $state('');

    onMount(async () => {
        await initializeFriends();
    });

    async function handleAddFriend(userId: string) {
        try {
            const result = await addFriend(userId);
            
            if (!result.success) {
                error = result.error || 'Failed to add friend';
                console.error("Failed to add friend:", result.error);
            }
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
            console.error("Error adding friend:", err);
        }
    }

    function isFriend(userId: string): boolean {
        return $friends.friendIds.has(userId);
    }

    function isPending(userId: string): boolean {
        return $friends.pendingRequests.has(userId);
    }
</script>

<main class="flex flex-col">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-semibold text-center mt-2 mx-auto">Social</h2>
        <div class="flex items-center bg-gray-100 rounded-full py-1 px-3">
            <UserCheck size={20} class="text-blue-500 mr-1.5" />
            <span class="font-medium">{$friends.friendCount}</span>
        </div>
    </div>

    <!-- Quests -->
    <h3 class="text-2xl text-gray-500 mb-4 pb-2 border-b border-gray-200">Quests</h3>
    <div class="space-y-3 mb-8">
        <div class="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
            <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <Users class="w-5 h-5 text-gray-500" />
            </div>
            <div class="flex-1">
                <p class="font-medium">Ernis</p>
                <p class="text-xs text-gray-500">Online now</p>
            </div>
            <button class="bg-blue-500 text-white rounded-full px-3 py-1 text-xs">Chat</button>
        </div>
        <button class="w-full bg-white border border-gray-200 rounded-full py-3 px-4 flex items-center justify-center gap-2">
            <Plus size="20" />
            <span>New Quest</span>
        </button>
    </div>

    <!-- Friends -->
    <h3 class="text-2xl text-gray-500 mb-4 pb-2 border-b border-gray-200">Friends</h3>
    <div class="space-y-3 mb-8 max-h-92 overflow-y-auto pr-2">
        {#if $friends.loading}
            <p class="text-center text-gray-500">Loading users...</p>
        {:else if error}
            <p class="text-center text-red-500">{error}</p>
        {:else if $friends.users.length === 0}
            <p class="text-center text-gray-500">No other users found</p>
        {:else}
            {#each $friends.users as user}
                <div class="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
                    <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users class="w-5 h-5 text-gray-500" />
                    </div>
                    <div class="flex-1">
                        <p class="font-medium">{user.displayname}</p>
                        <p class="text-xs text-gray-500">Online now</p>
                    </div>
                    <button 
                        class={`${isFriend(user.user_id) ? 'bg-green-500' : 'bg-blue-500'} text-white rounded-full px-3 py-1 text-xs cursor-pointer`}
                        onclick={() => handleAddFriend(user.user_id)}
                        disabled={isFriend(user.user_id) || isPending(user.user_id)}
                    >
                        {#if isPending(user.user_id)}
                            ●●●
                        {:else}
                            {isFriend(user.user_id) ? 'Added' : 'Add'}
                        {/if}
                    </button>
                </div>
            {/each}
        {/if}
    </div>
</main>