<script>
    import { onMount } from "svelte";
    import { user } from "$lib/auth";
    import { goto } from "$app/navigation";
    import { supabase } from "$lib/supabase";

    onMount(() => {
        const unsubscribe = user.subscribe((value) => {
            if (value === null) {
                goto("/");
            }
        });

        return unsubscribe;
    });

    async function handleLogout() {
        await supabase.auth.signOut();
        goto('/');
    }
</script>

{#if $user}
    <button 
        onclick={handleLogout}
        class="text-center py-2 px-4 rounded bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
    >
        Abmelden
    </button>
    <slot />
{:else}
    <p>Lädt...</p>
{/if}
