<script lang="ts">
    import { userProfile } from "$lib/auth";

    const days = ['M', 'T', 'W', 'T', 'F', 'S'];
    let lastStreakDay = $state(-1);
    let lastStreak = $state("");

    userProfile.subscribe((profile) => {
        lastStreak = profile?.streak.updated_at as string;
    });

    const today = new Date();
    const startOfWeek = new Date(today);
    let lastStreakDate = $derived(new Date(lastStreak));

    startOfWeek.setDate(today.getDate() - today.getDay() + 1); // Monday of current week
    startOfWeek.setHours(0, 0, 0, 0);

    // If lastStreak is in current week, calculate the day index (0 for Monday)
    $effect(() => {
        if (lastStreakDate >= startOfWeek) {
            lastStreakDay = lastStreakDate.getDay() - 1;
        }
    });
</script>

<div class="bg-gray-50 rounded-3xl p-4 flex justify-between mb-4">
    {#each days as day, index}
        <div 
            class={`w-10 h-10 flex items-center justify-center rounded-full relative
            ${index <= lastStreakDay ? 'bg-blue-500 text-white' : 'text-gray-400'}
        `}>
            {day}
            {#if index === today.getDay() - 1}
                <span class="absolute inset-0 rounded-full bg-blue-300 ping"></span>
            {/if}
        </div>
    {/each}
</div>

<style>
    .ping {
        animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite;
    }
    @keyframes ping {
        75%, 100% {
            transform: scale(1.5);
            opacity: 0;
        }
    }
</style>
