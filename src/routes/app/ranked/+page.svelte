<script lang="ts">
    import { Users, Star, Medal } from 'lucide-svelte';

    export let data;
    let users = data.users || [];
    let error = data.error || '';

    function getMedalColor(index: number): string {
        switch(index) {
            case 0: return "text-yellow-500";
            case 1: return "text-gray-400";
            case 2: return "text-amber-700";
            default: return "text-blue-500";
        }
    }
</script>


<main class="flex flex-col">
    <!-- Header with friend count -->
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-semibold text-center mt-2 mx-auto">Ranked</h2>
    </div>

    <h3 class="text-2xl text-gray-500 mb-4 pb-2 border-b border-gray-200">Leaderboard</h3>
    <div class="space-y-3 mb-8 overflow-y-auto pr-2">
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