<script>
    import { goto } from "$app/navigation";
    import { user } from "$lib/stores";
    import { loadProfile } from "$lib/helper";
    import "$lib/auth";
    import Navbar from "$lib/components/Navbar.svelte";

    let { children } = $props();

    user.subscribe((value) => {
        if (!value) {
            goto('/');
        } else {
            loadProfile()
        }
    });
</script>


{#if $user}
    <div class="h-screen flex flex-col bg-white p-4 max-w-md mx-auto">
        {@render children()}
        <div class="flex-none mt-auto">
            <Navbar />
        </div>
    </div>
{:else}
    <p>Lädt...</p>
{/if}