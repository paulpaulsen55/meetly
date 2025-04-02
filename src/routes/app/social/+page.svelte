<script lang="ts">
    import { UserCheck } from 'lucide-svelte';
    import { friends } from '$lib/stores';
    import QuestWrapper from '$lib/components/social/QuestWrapper.svelte';
    import FriendWrapper from '$lib/components/social/FriendWrapper.svelte';
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
    <FriendWrapper/>
</main>