<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import StreakCounter from '$lib/components/StreakCounter.svelte';
    import WeekStreak from '$lib/components/WeekStreak.svelte';
    import UpcomingEvents from '$lib/components/UpcomingEvents.svelte';
    import Navbar from '$lib/components/Navbar.svelte';
</script>

<main class="h-screen flex flex-col bg-white p-4 max-w-md mx-auto">
    <div class="flex-none">
        <Header />
    </div>

    <div class="flex-grow flex flex-col gap-3 min-h-0">
        <StreakCounter />
        <WeekStreak />
        <UpcomingEvents />
    </div>
    
    <div class="flex-none mt-auto">
        <Navbar />
    </div>
</main>