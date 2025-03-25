<script lang="ts">
    import { Plus, Users, UserCheck } from 'lucide-svelte';
    import { onMount } from 'svelte';
    import Navbar from '$lib/components/Navbar.svelte';
    import { getAllUsers, addFriend } from '$lib/helper';
    import { supabase } from '$lib/supabase';

    interface User {
        displayname: string;
        user_id: string;
    }

    let users = $state<User[]>([]);
    let addedFriends = $state(new Set<string>());
    let friendCount = $state(0);
    let friendRequestLoading = $state<Record<string, boolean>>({});
    let loading = $state(true);
    let error = $state('');

    onMount(async () => {
        loading = true;
        await loadInitialData();
        loading = false;
    });

    async function loadInitialData() {
        const [userData, userAuth] = await Promise.all([
            getAllUsers(),
            supabase.auth.getUser()
        ]);
        
        // Process users data
        if (userData.success) {
            users = userData.users;
        } else {
            error = userData.error || 'Failed to fetch users';
        }

        const userId = userAuth.data?.user?.id;
        if (userId) {
            await Promise.all([
                loadFriendCount(userId),
                loadExistingFriends(userId)
            ]);
        }
    }

    async function loadFriendCount(userId: string) {
        try {
            const { count, error: countError } = await supabase
                .from('friends')
                .select('*', { count: 'exact', head: true })
                .or(`user_id.eq.${userId},friends_id.eq.${userId}`);
                
            if (countError) throw countError;
            friendCount = count || 0;
        } catch (err) {
            console.error("Error loading friend count:", err);
        }
    }

    async function loadExistingFriends(userId: string) {
        try {
            const { data: friendships, error: friendshipError } = await supabase
                .from('friends')
                .select('user_id, friends_id')
                .or(`user_id.eq.${userId},friends_id.eq.${userId}`);
                
            if (friendshipError) throw friendshipError;
            
            // Create friend ID set
            const friendIds = new Set<string>();
            friendships?.forEach(friendship => {
                const otherId = friendship.user_id === userId ? friendship.friends_id : friendship.user_id;
                friendIds.add(otherId);
            });
            
            // Mark existing friends
            addedFriends = new Set(
                users
                    .filter(user => friendIds.has(user.user_id))
                    .map(user => user.displayname)
            );
        } catch (err) {
            console.error("Error loading existing friends:", err);
        }
    }

    async function updateFriend(displayname: string, friendId: string) {
        // Set loading state for this button
        friendRequestLoading = { ...friendRequestLoading, [friendId]: true };
        
        try {
            const result = await addFriend(friendId);
            
            if (result.success) {
                addedFriends = new Set([...addedFriends, displayname]);
                friendCount++;
            } else {
                error = result.error || 'Failed to add friend';
                console.error("Failed to add friend:", result.error);
            }
        } catch (err) {
            error = err instanceof Error ? err.message : 'An error occurred';
            console.error("Error adding friend:", err);
        } finally {
            // Clear loading state
            const updated = { ...friendRequestLoading };
            delete updated[friendId];
            friendRequestLoading = updated;
        }
    }
</script>

<main class="h-screen flex flex-col bg-white p-4 max-w-md mx-auto">
    <div class="flex justify-between items-center mb-6">
        <h2 class="text-3xl font-semibold text-center mt-2 mx-auto">Social</h2>
        <div class="flex items-center bg-gray-100 rounded-full py-1 px-3">
            <UserCheck size={20} class="text-blue-500 mr-1.5" />
            <span class="font-medium">{friendCount}</span>
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
                        onclick={() => updateFriend(user.displayname, user.user_id)}
                        disabled={addedFriends.has(user.displayname) || friendRequestLoading[user.user_id]}
                    >
                        {#if friendRequestLoading[user.user_id]}
                            ●●●
                        {:else}
                            {addedFriends.has(user.displayname) ? 'Added' : 'Add'}
                        {/if}
                    </button>
                </div>
            {/each}
        {/if}
    </div>

    <div class="flex-none mt-auto">
        <Navbar />
    </div>
</main>