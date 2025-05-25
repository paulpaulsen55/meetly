<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import UpcomingEvents from '$lib/components/UpcomingEvents.svelte';
    import CoinDisplay from '$lib/components/CoinDisplay.svelte';
    import { Info } from 'lucide-svelte';
</script>

<main class="flex flex-col h-fit gap-6 overflow-y-auto">
    <div class="">
        <Header />
    </div>

    <CoinDisplay />
    <div>
        <span class="text-gray-500 text-sm font-medium mb-1">
            <Info class="inline-block w-4 h-4" />
            advertisment
        </span>
        <a href="/app/shop">
            <img src="/advertisment.svg" alt="advertisment" class="w-full h-auto rounded-3xl shadow-sm border border-gray-200" />
        </a>
    </div>
    <UpcomingEvents />
</main>