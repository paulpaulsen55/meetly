<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import UpcomingEvents from '$lib/components/UpcomingEvents.svelte';
    import CoinDisplay from '$lib/components/CoinDisplay.svelte';
</script>

<main class="h-screen flex flex-col bg-white p-4 max-w-md mx-auto">
    <div class="flex-none">
        <Header />
    </div>

    <div class="flex-grow flex flex-col gap-3">
        <CoinDisplay />
        <!-- <StreakCounter /> -->
        <!-- <WeekStreak /> -->
        <UpcomingEvents />
    </div>
    
    <div class="flex-none mt-auto pt-4">
        <!-- <InputWrapper /> -->
    </div>
</main>