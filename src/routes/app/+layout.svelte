<script>
    import { goto } from "$app/navigation";
    import { user } from "$lib/stores";
    import { loadProfile } from "$lib/helper";
    import { startMessages } from "$lib/notification";
    import "$lib/auth";
    import Navbar from "$lib/components/Navbar.svelte";

    let { children } = $props();

    user.subscribe((value) => {
        if (!value) {
            goto('/');
        } else {
            loadProfile();
            startMessages();
        }
    });

</script>


{#if $user}
    <div class="h-screen overflow-hidden flex flex-col bg-white p-4 max-w-md mx-auto">
        <div class="flex-1 overflow-auto">
            {@render children()}
        </div>
        <div class="mt-auto bottom-0">
            <Navbar />
        </div>
    </div>
{:else}
    <p>Lädt...</p>
{/if}