<script lang="ts">
    import { UserCheck } from 'lucide-svelte';
    import QuestWrapper from '$lib/components/social/QuestWrapper.svelte';
    import FriendWrapper from '$lib/components/social/FriendWrapper.svelte';
    import type { PageProps } from './$types';

    let { data }: PageProps = $props();
</script>

<main class="flex flex-col h-full gap-6">
    <!-- Header with friend count -->
    <div class="flex justify-between items-center">
        <h2 class="text-3xl font-semibold text-center mt-2 mx-auto">Social</h2>
        <div class="flex items-center bg-gray-100 rounded-full py-1 px-3">
            <UserCheck size={20} class="text-blue-500 mr-1.5" />
            <span class="font-medium">{data.friendsCount}</span>
        </div>
    </div>

    <QuestWrapper quests={data.quests} hasTicket={data.hasTicket} />
    <FriendWrapper users={data.users} hasTicket={data.hasTicket} />
</main>