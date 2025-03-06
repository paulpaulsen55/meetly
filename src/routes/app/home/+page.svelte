<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import StreakCounter from '$lib/components/StreakCounter.svelte';
    import WeekStreak from '$lib/components/WeekStreak.svelte';
    import UpcomingEvents from '$lib/components/UpcomingEvents.svelte';
    import InputButtons from '$lib/components/InputButtons.svelte';

</script>

<main class="min-h-screen bg-white p-4 max-w-md mx-auto">
    <Header name="User" />
    <StreakCounter />
    <WeekStreak />
    <UpcomingEvents />
    <InputButtons />
</main>