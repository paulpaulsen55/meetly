<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import UpcomingEvents from '$lib/components/UpcomingEvents.svelte';
    import CoinDisplay from '$lib/components/CoinDisplay.svelte';
    import WeekStreak from '$lib/components/WeekStreak.svelte';
</script>

<main class="flex flex-col">
    <div class="flex-none">
        <Header />
    </div>

    <div class="flex-grow flex flex-col min-h-0">
        <div class="flex-none mb-3">
            <CoinDisplay />
        </div>
        <div class="flex-none mb-3">
            <WeekStreak />
        </div>
        
        <div class="flex-grow overflow-hidden min-h-0">
            <UpcomingEvents />
        </div>
    </div>
</main>