<script>
    import { goto } from "$app/navigation";
    import { user } from "$lib/stores";
    import { loadProfile } from "$lib/helper";
    import { supabase } from "$lib/supabase";
    import { ChevronLeft } from "lucide-svelte";

    user.subscribe((value) => {
        if (!value) {
            goto("/");
        } else {
            loadProfile();
        }
    });
</script>

<main class="h-screen flex flex-col bg-white p-4 max-w-md mx-auto">
    <h1
        class="text-3xl font-bold text-center mb-6 flex items-center justify-center"
    >
        <a href="/app/home">
            <ChevronLeft size={35} />
        </a>
        <span>Settings<span> </span></span>
    </h1>
    {#if $user}
        <button
            onclick={async () => supabase.auth.signOut()}
            class="text-center py-2 px-4 rounded bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
        >
            Abmelden
        </button>
    {:else}
        <p>Lädt...</p>
    {/if}
</main>
