<script lang="ts">
    import { Plus, Users } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import Navbar from '$lib/components/Navbar.svelte';
    import { getAllUsers } from '$lib/helper';

    interface User {
        displayname: string;
    }

    let users = $state<User[]>([]);
    let addedFriends = $state(new Set<string>());
    let loading = $state(true);
    let error = $state('');

    onMount(async () => {
        loading = true;
        const result = await getAllUsers();
        if (result.success) {
            users = result.users;
        } else {
            error = result.error || 'Failed to fetch users';
        }
        loading = false;
    });

    function addFriend(displayname: string) {
        addedFriends = new Set([...addedFriends, displayname]);
    }
</script>

<main class="h-screen flex flex-col bg-white p-4 max-w-md mx-auto">
    <h2 class="text-3xl font-semibold text-center mb-6 mt-2">Social</h2>

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
        {#if loading}
            <p class="text-center text-gray-500">Loading users...</p>
        {:else if error}
            <p class="text-center text-red-500">{error}</p>
        {:else if users.length === 0}
            <p class="text-center text-gray-500">No other users found</p>
        {:else}
            {#each users as user}
                <div class="flex items-center gap-3 bg-gray-100 rounded-xl p-3">
                    <div class="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                        <Users class="w-5 h-5 text-gray-500" />
                    </div>
                    <div class="flex-1">
                        <p class="font-medium">{user.displayname}</p>
                        <p class="text-xs text-gray-500">Online now</p>
                    </div>
                    <button 
                        class={`${addedFriends.has(user.displayname) ? 'bg-green-500' : 'bg-blue-500'} text-white rounded-full px-3 py-1 text-xs cursor-pointer`}
                        onclick={() => addFriend(user.displayname)}
                        disabled={addedFriends.has(user.displayname)}
                    >
                        {addedFriends.has(user.displayname) ? 'Added' : 'Add'}
                    </button>
                </div>
            {/each}
        {/if}
    </div>

    <div class="flex-none mt-auto">
        <Navbar />
    </div>
</main>