<script lang="ts">
    import { Users, Star, Medal, Trophy } from 'lucide-svelte';
    import { userProfile } from '$lib/stores';
    
    export let data;
    let users = data.users || [];
    let error = data.error || '';

    function getUserRank(coins: number): string {
        if (coins >= 100) return "Gold Rank";
        if (coins >= 50) return "Silver Rank";
        return "Bronze Rank";
    }
    
    function getMedalColor(index: number): string {
        switch(index) {
            case 0: return "text-yellow-500";
            case 1: return "text-gray-400";
            case 2: return "text-amber-700";
            default: return "text-blue-500";
        }
    }
</script>

<main class="flex flex-col h-full gap-6">
    <!-- Header with title -->
    <div class="flex justify-between items-center">
        <h2 class="text-3xl font-semibold text-center mt-2 mx-auto">Ranked</h2>
    </div>
    
    <!-- User Profile Section -->
    <div class="bg-white rounded-xl p-4 flex items-center gap-4 shadow-sm border border-gray-100">
        <div class="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center">
            <Users class="w-7 h-7 text-gray-500" />
        </div>
        <div>
            <h2 class="text-xl font-semibold">{$userProfile?.displayname || 'User'}</h2>
            <p class="text-sm text-gray-500">{getUserRank($userProfile?.coins || 0)} · {$userProfile?.coins || 0} MeetCoins</p>
        </div>
    </div>
    
    <!-- Badges Section -->
    <div class="space-y-4">
        <h3 class="text-2xl text-gray-500 pb-2 border-b border-gray-200">Your Badges</h3>
        {#if data.badge}
            <div class="bg-blue-50 border border-blue-200 rounded-xl p-4">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                        <Trophy class="w-5 h-5 text-blue-500" />
                    </div>
                    <div>
                        <h3 class="font-semibold text-blue-700 mb-0.5">New Badge: {data.badge.title}</h3>
                        <p class="text-sm text-blue-600">{data.badge.description}</p>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    
    <!-- Leaderboard Section -->
    <h3 class="text-2xl text-gray-500 pb-2 border-b border-gray-200">Leaderboard</h3>
    <div class="space-y-3 flex-1 overflow-y-auto pr-2">
        {#if error}
            <p class="text-center text-red-500">{error}</p>
        {/if}
    
        {#each users as user, index}
            <div class="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
                <div class="flex items-center justify-center w-10 h-10">
                    {#if index < 3}
                        <Medal class="w-6 h-6 {getMedalColor(index)}" />
                    {:else}
                        <div class="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <span class="text-blue-600 font-medium">{index + 1}</span>
                        </div>
                    {/if}
                </div>
                <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <Users class="w-5 h-5 text-gray-500" />
                </div>
                <div class="flex-1">
                    <p class="font-medium">{user.displayname}</p>
                    <p class="text-xs text-gray-500">Rank #{index + 1}</p>
                </div>
                <div class="flex items-center gap-1">
                    <Star class="w-4 h-4 text-blue-500" />
                    <span class="font-bold">{user.coins}</span>
                </div>
            </div>
        {:else}
            <p class="text-center text-gray-500">No users found</p>
        {/each}
    </div>
</main>