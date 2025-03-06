<script>
    import { Settings } from 'lucide-svelte';
    
    export let name = '';
</script>

<header class="flex justify-between items-center mb-4">
    <h1 class="text-4xl font-bold">Hallo, <br> {name}</h1>
    <a href="/settings"><Settings size={32} /></a>
</header>