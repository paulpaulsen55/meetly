<script lang="ts">
    import { ShoppingBasket, Mic, Users, Trophy } from "lucide-svelte";
    import { page } from "$app/state";
    import Drawer from "./Drawer.svelte";
    import DrawerVoiceInput from "./DrawerVoiceInput.svelte";

    const currentPath: string = $derived(page.url.pathname);

    function isActive(path: string) {
        return currentPath === path;
    }
</script>

<nav class="border-t-2 border-gray-200 pt-2 mt-2">
    <div class="flex justify-between items-end">
        <div class="flex space-x-8 ml-4 mb-1">
            <a href="/app/home" class="flex flex-col items-center">
                <!-- Custom house icon without the middle vector -->
                <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="40" 
                height="40" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                stroke-width="1.5" 
                stroke-linecap="round" 
                stroke-linejoin="round" 
                class="{isActive('/app/home') ? 'text-blue-500 fill-blue-100' : 'text-gray-500'}"
                >
                <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                </svg>
                <span class="text-xs mt-1 text-gray-500">Home</span>
            </a>
            <a href="/app/shop" class="flex flex-col items-center">
                <ShoppingBasket size={40} class="{isActive('/app/shop') ? 'text-blue-500 fill-blue-100' : 'text-gray-500'}" strokeWidth={1.5} />
                <span class="text-xs mt-1 text-gray-500">Shop</span>
            </a>
        </div>
        
        <Drawer>
            {#snippet button()}
                <div
                    class="w-20 h-20 bg-blue-500 text-white rounded-full shadow-lg
                        hover:bg-blue-600 active:bg-blue-700 active:scale-95 transition-all duration-150 cursor-pointer grid place-items-center"
                    aria-label="Activate microphone"
                >
                    <Mic size={40} class="block mx-auto" />
                </div>
            {/snippet}
            {#snippet title()}
                Voice Input
            {/snippet} 
            
            <DrawerVoiceInput />
        </Drawer>
        
        <div class="flex space-x-8 mr-4 mb-1">
            <a href="/app/social" class="flex flex-col items-center">
                <Users size={40} class="{isActive('/app/social') ? 'text-blue-500 fill-blue-100' : 'text-gray-500'}" strokeWidth={1.5} />
                <span class="text-xs mt-1 text-gray-500">Social</span>
            </a>
            <a href="/app/ranked" class="flex flex-col items-center">
                <Trophy size={40} class="{isActive('/app/ranked') ? 'text-blue-500 fill-blue-100' : 'text-gray-500'}" strokeWidth={1.5} />
                <span class="text-xs mt-1 text-gray-500">Ranked</span>
            </a>
        </div>
    </div>
</nav>