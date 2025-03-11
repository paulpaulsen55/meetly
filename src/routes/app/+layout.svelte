<script>
    import { goto } from "$app/navigation";
    import { user } from "$lib/auth";
    import { loadProfile, supabase } from "$lib/supabase";

    user.subscribe((value) => {
        if (!value) {
            goto('/');
        } else {
            loadProfile()
        }
    });
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
