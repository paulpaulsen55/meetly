<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import UpcomingEvents from '$lib/components/UpcomingEvents.svelte';
    import CoinDisplay from '$lib/components/CoinDisplay.svelte';
    import Navbar from '$lib/components/Navbar.svelte';
</script>

<main class="h-screen flex flex-col bg-white p-4 max-w-md mx-auto overflow-hidden">
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
    
    <div class="flex-none mt-3">
        <Navbar />
    </div>
</main>