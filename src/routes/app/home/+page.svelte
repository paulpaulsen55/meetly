<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import StreakCounter from '$lib/components/StreakCounter.svelte';
    import WeekStreak from '$lib/components/WeekStreak.svelte';
    import UpcomingEvents from '$lib/components/UpcomingEvents.svelte';
    import InputWrapper from '$lib/components/InputButtons.svelte';
</script>

<main class="h-screen flex flex-col bg-white p-4 max-w-md mx-auto">
    <div class="flex-none">
        <Header />
    </div>

    <div class="flex-grow overflow-y-auto flex flex-col gap-3">
        <StreakCounter />
        <WeekStreak />
        <UpcomingEvents />
    </div>
    
    <div class="flex-none mt-auto pt-4">
        <InputWrapper />
    </div>
</main>