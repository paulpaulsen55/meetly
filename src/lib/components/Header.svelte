<script lang="ts">
    import { userProfile } from '$lib/stores';
    import { Settings } from 'lucide-svelte';
</script>

<header class="flex justify-between items-center mb-4">
    <h1 class="text-4xl font-bold">Hallo, <br> {$userProfile?.displayname}</h1>
    <a href="/app/settings"><Settings size={32} /></a>
</header>