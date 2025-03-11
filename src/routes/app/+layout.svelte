<script>
    import { user } from "$lib/auth";
    import { supabase } from "$lib/supabase";
</script>

{#if $user}
    <button 
        onclick={async() => supabase.auth.signOut()}
        class="text-center py-2 px-4 rounded bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
    >
        Abmelden
    </button>
    <slot />
{:else}
    <p>Lädt...</p>
{/if}
