<script lang="ts">
    import { Users, UserCheck, Ticket, X } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import { friends, userProfile, quests as questsStore } from '$lib/stores';
    import { initializeFriends, addFriend } from '$lib/friends';
    import { 
        checkForQuestTicket, 
        loadActiveQuests, 
        createQuestWithFriend, 
        selectQuest,
        clearSelectedQuest
    } from '$lib/quests';

    let error = $state('');
    
    // Initialization
    onMount(() => {
        Promise.all([
            initializeFriends(),
            checkForQuestTicket()
        ]);
        
        if ($userProfile?.user_id) loadActiveQuests();
    });

    // Load quests when profile becomes available
    $effect(() => {
        if ($userProfile?.user_id) loadActiveQuests();
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

    async function handleCreateQuest(friendId: string) {
        try {
            const result = await createQuestWithFriend(friendId);
            if (!result.success) error = result.error || 'Failed to create quest';
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
        }
    }
</script>

<main class="flex flex-col">
    <!-- Header with friend count -->
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-semibold text-center mt-2 mx-auto">Social</h2>
        <div class="flex items-center bg-gray-100 rounded-full py-1 px-3">
            <UserCheck size={20} class="text-blue-500 mr-1.5" />
            <span class="font-medium">{$friends.friendCount}</span>
        </div>
    </div>

    <!-- Quests section -->
    <h3 class="text-2xl text-gray-500 mb-4 pb-2 border-b border-gray-200">Quests</h3>
    <div class="space-y-3 mb-8">
        {#if $questsStore.selectedQuest}
            <!-- Selected quest details -->
            <div class="flex flex-col bg-blue-50 rounded-xl p-4 border border-blue-200">
                <div class="flex justify-between items-start mb-2">
                    <h4 class="font-bold text-lg">{$questsStore.selectedQuest.title}</h4>
                    <button class="p-1 hover:bg-blue-100 rounded-full" onclick={clearSelectedQuest}>
                        <X size={18} />
                    </button>
                </div>
                <p class="text-sm mb-1">{$questsStore.selectedQuest.description}</p>
                <p class="text-sm font-medium text-blue-700 mb-2">Reward: {$questsStore.selectedQuest.reward} coins</p>
                <button class="self-end bg-blue-500 text-white rounded-full px-3 py-1 text-xs">
                    Start Quest
                </button>
            </div>
        {:else if $questsStore.activeQuests.length > 0}
            <!-- Active quests list -->
            {#each $questsStore.activeQuests as quest}
                <div class="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users class="w-5 h-5 text-blue-500" />
                    </div>
                    <div class="flex-1">
                        <p class="font-medium">{quest.title}</p>
                        <p class="text-xs text-gray-500">With {quest.friend_name}</p>
                        <p class="text-xs text-blue-600">Reward: {quest.reward} coins</p>
                    </div>
                    <button 
                        class="bg-blue-500 text-white rounded-full px-3 py-1 text-xs"
                        onclick={() => selectQuest(quest)}
                    >
                        View
                    </button>
                </div>
            {/each}
        {:else}
            <!-- No active quests -->
            <div class="flex items-center gap-3 bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                <p class="w-full text-gray-500">No active quests. Create one with a friend below!</p>
            </div>
        {/if}
        
        <!-- Quest ticket notification -->
        {#if $questsStore.hasTicket}
            <div class="flex items-center gap-2 justify-center bg-blue-50 rounded-xl p-3 border border-blue-200">
                <Ticket size={16} class="text-blue-500" />
                <p class="text-sm text-blue-700">You have Friend Quest tickets! Click on a friend to start a quest.</p>
            </div>
        {/if}
    </div>

    <!-- Friends section -->
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
                    {#if isFriend(user.user_id) && $questsStore.hasTicket}
                        <button 
                            class="bg-green-500 text-white rounded-full px-3 py-1 text-xs cursor-pointer flex items-center gap-1"
                            onclick={() => handleCreateQuest(user.user_id)}
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
                </div>
            {/each}
        {/if}
    </div>
</main>