<script lang="ts">
    import { invalidate } from "$app/navigation";
    import { confirmQuest } from "$lib/quests";
    import { CheckCircle, Users, X, Ticket } from "lucide-svelte";

    let { quests, hasTicket } = $props();
    let activeQuest = $state(-1);

    async function startQuest(questId: number) {
        await confirmQuest(questId);
        invalidate("app:quests");
    }
</script>

<h3 class="text-2xl text-gray-500 pb-2 border-b border-gray-200">Quests</h3>
<div class="space-y-3 h-full max-h-60 overflow-y-auto">
        {#each quests as quest, i}
            {#if i == activeQuest}
                <div class="flex flex-col bg-blue-50 rounded-xl p-4 border border-blue-200">
                    <div class="flex justify-between items-start mb-2">
                        <h4 class="font-bold text-lg">{quest.title}</h4>
                        <button class="p-1 hover:bg-blue-100 rounded-full" onclick={() => activeQuest = -1}>
                            <X size={18} />
                        </button>
                    </div>
                    <p class="text-sm mb-3">{quest.description}</p>
                    
                    <!-- Quest status and progress -->
                    <div class="bg-white rounded-lg p-3 mb-3 border border-blue-100">
                        <p class="text-sm font-medium mb-2">Status: 
                            <span class={quest.status === 'done' ? 
                                'text-green-500' : 'text-blue-500'}>
                                {quest.status}
                            </span>
                        </p>
                        
                        <!-- Participants -->
                        <p class="text-sm font-medium mb-1">Participants:</p>
                        <div class="flex items-center gap-2 mb-2">
                            <div class="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                                <div class="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                    {quest.initiated.displayname.charAt(0)}
                                </div>
                                <span class="text-xs">{quest.initiated.displayname}</span>
                                
                                <!-- Check if the current user is user1 or user2 and show correct status -->
                                {#if (quest.isFriend && quest.friend_completed) || 
                                    (!quest.isFriend && quest.initiated_completed)}
                                    <CheckCircle size={14} class="text-green-500" />
                                {/if}
                            </div>
                            
                            <div class="flex items-center gap-2 bg-gray-100 rounded-full px-2 py-1">
                                <div class="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                                    {quest.friend.displayname.charAt(0)}
                                </div>
                                <span class="text-xs">{quest.friend.displayname}</span>
                                
                                <!-- Show friend's completion status -->
                                {#if (quest.isFriend && quest.initiated_completed) || 
                                    (!quest.isFriend && quest.friend_completed)}
                                    <CheckCircle size={14} class="text-green-500" />
                                {/if}
                            </div>
                        </div>
                        
                        <!-- Progress notice -->
                        <p class="text-xs text-gray-500">
                            Complete the quest objective to earn {quest.reward} coins!
                        </p>
                    </div>
                    
                    <!-- Reward information -->
                    <div class="flex justify-between items-center">
                        <p class="text-sm font-medium">Reward: {quest.reward} coins</p>
                        {#if quest.isFriend && quest.status === 'active'}
                            <button 
                                class="bg-blue-500 text-white rounded-full px-3 py-1 text-xs"
                                onclick={() => startQuest(quest.id)}
                            >
                                start
                            </button>
                        {:else if quest.status === 'active'}
                            <p class="text-sm font-medium text-blue-700">waiting for friend...</p>
                        {:else if quest.status === 'done'}
                            <div class="flex items-center gap-2">
                                <CheckCircle size={16} class="text-green-500" />
                                <p class="text-sm font-medium text-green-600">Quest completed!</p>
                            </div>
                        {/if}
                    </div>

                    <!-- Add celebration banner for completed quests -->
                    {#if quest.status === 'done'}
                        <div class="mt-3 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                            <p class="text-green-700 font-medium">Congratulations!</p>
                            <p class="text-sm text-green-600">You've earned {quest.reward} coins for completing this quest!</p>
                        </div>
                    {/if}
                </div>  
            {:else}
                <div class="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Users class="w-5 h-5 text-blue-500" />
                    </div>
                    <div class="flex-1">
                        <p class="font-medium">{quest.title}</p>
                        <p class="text-xs text-gray-500">With {quest.isFriend ? quest.initiated.displayname : quest.friend.displayname}</p>
                        <p class="text-xs text-blue-600">Reward: {quest.reward} coins</p>
                    </div>
                    <button 
                        class="bg-blue-500 text-white rounded-full px-3 py-1 text-xs"
                        onclick={() => activeQuest = i}
                    >
                        View
                    </button>
                </div>
            {/if}
        {:else}
            <div class="flex items-center gap-3 bg-gray-50 rounded-xl p-4 text-center border border-gray-200">
                <p class="w-full text-gray-500">No active quests. Create one with a friend below!</p>
            </div>
        {/each}
    

    {#if hasTicket}
        <div class="flex items-center gap-2 justify-center bg-blue-50 rounded-xl p-3 border border-blue-200">
            <Ticket size={16} class="text-blue-500" />
            <p class="text-sm text-blue-700">You have Friend Quest tickets! Click on a friend to start a quest.</p>
        </div>
    {/if}
</div>