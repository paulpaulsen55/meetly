<script lang="ts">
    import Header from '$lib/components/Header.svelte';
    import UpcomingEvents from '$lib/components/UpcomingEvents.svelte';
    import CoinDisplay from '$lib/components/CoinDisplay.svelte';
    import { Info } from 'lucide-svelte';
</script>

<main class="flex flex-col">
    <div class="flex-none">
        <Header />
    </div>

    <div class="flex-grow flex flex-col min-h-0 gap-3">
        <div class="flex-none">
            <CoinDisplay />
        </div>
        <div class="flex-none">
            <span class="text-gray-500 text-sm font-medium mb-1">
                <Info class="inline-block w-4 h-4" />
                advertisment
            </span>
            <a href="/app/shop">
                <img src="/advertisment.svg" alt="advertisment" class="w-full h-auto rounded-3xl shadow-sm border border-gray-200" />
            </a>
        </div>
        
        <div class="flex-grow overflow-hidden min-h-0">
            <UpcomingEvents />
        </div>
    </div>
</main>