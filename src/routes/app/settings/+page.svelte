<script lang="ts">
    import { n8nServer } from "$lib/stores";
    import { supabase } from "$lib/supabase";
    import { Check, ChevronLeft, Loader2 } from "lucide-svelte";

    let timer: NodeJS.Timeout | null = null;
    let loading = $state(false);

    const debounce = (value: string) => {
        if (timer !== null) clearTimeout(timer);
        loading = true;
        timer = setTimeout(() => {
            n8nServer.set(value);
            loading = false;
        }, 600);
    };
</script>

<main class="flex flex-col space-y-5">
    <h1
        class="text-3xl font-bold text-center mb-6 flex items-center justify-center"
    >
        <a href="/app/home">
            <ChevronLeft size={35} />
        </a>
        <span>Settings<span> </span></span>
    </h1>
    <button
        onclick={async () => supabase.auth.signOut()}
        class="text-center py-2 px-4 rounded bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
    >
        Abmelden
    </button>
    <div class="flex items-center">
        <input
            type="text"
            value={$n8nServer}
            oninput={(e) => debounce(e.currentTarget.value)}
            class="flex-grow bg-white border border-gray-300 rounded-full py-3 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        {#if loading}
            <Loader2 class="animate-spin ml-2 text-blue-500" />
        {:else}
            <Check class="ml-2 text-green-500" />
        {/if}
    </div>
</main>
