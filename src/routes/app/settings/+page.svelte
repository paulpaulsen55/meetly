<script>
    import { supabase } from "$lib/supabase";
    import { ChevronLeft } from "lucide-svelte";
</script>

<main class="flex flex-col">
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
</main>
