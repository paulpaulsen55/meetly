<script lang="ts">
    import { Users, UserCheck, Ticket, X, CheckCircle, Clock } from 'lucide-svelte';
    import { onMount, onDestroy } from 'svelte';
    import { friends, userProfile, user } from '$lib/stores';
    import { initializeFriends, addFriend } from '$lib/friends';
    import { 
        checkForQuestTicket, 
        getAllQuests, 
        createQuestWithFriend,
    } from '$lib/quests';
    import QuestWrapper from '$lib/components/social/QuestWrapper.svelte';

    let error = $state('');
    let activeQuestView = $state(false);
    
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

    async function handleCreateQuest(friendId: string) {
        // try {
        //     const result = await createQuestWithFriend(friendId);
        //     if (!result.success) error = result.error || 'Failed to create quest';
        // } catch (err) {
        //     error = err instanceof Error ? err.message : 'An error occurred';
        // }
    }
    
    async function handleStartQuest() {
        // if (!$quests.selectedQuest) return;
        
        // try {
        //     const result = await startQuest($quests.selectedQuest.id);
        //     if (result.success) {
        //         activeQuestView = true;
        //         // Start checking for quest progress periodically
        //         startQuestProgressCheck();
        //     } else {
        //         error = result.error || 'Failed to start quest';
        //     }
        // } catch (err) {
        //     error = err instanceof Error ? err.message : 'An error occurred';
        // }
    }
    
    // Check quest progress periodically when in active view
    let progressInterval: ReturnType<typeof setInterval>;
    
    function startQuestProgressCheck() {
        // if (progressInterval) clearInterval(progressInterval);
        
        // Check immediately once
        // if ($quests.selectedQuest) {
        //     checkQuestProgress($quests.selectedQuest.id);
        // }
        
        // Then check every 30 seconds
        // progressInterval = setInterval(() => {
        //     if ($quests.selectedQuest) {
        //         checkQuestProgress($quests.selectedQuest.id);
        //     } else {
        //         clearInterval(progressInterval);
        //     }
        // }, 30000);
    }
    
    // Clean up interval when component is destroyed
    onDestroy(() => {
        if (progressInterval) clearInterval(progressInterval);
    });
    
    function exitActiveQuestView() {
        activeQuestView = false;
        if (progressInterval) clearInterval(progressInterval);
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
    <QuestWrapper />

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
                    <!-- {#if isFriend(user.user_id) && $quests.hasTicket}
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
                    {/if} -->
                </div>
            {/each}
        {/if}
    </div>
</main>