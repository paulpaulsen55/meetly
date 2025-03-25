<script>
    import { goto } from "$app/navigation";
    import { user } from "$lib/stores";
    import { loadProfile } from "$lib/helper";
    
    import "$lib/auth";

    user.subscribe((value) => {
        
        if (!value) {
            goto('/');
        } else {
            loadProfile()
        }
    });
</script>


{#if $user}
    <slot />
{:else}
    <p>Lädt...</p>
{/if}