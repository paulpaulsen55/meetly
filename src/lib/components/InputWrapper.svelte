<script lang="ts">
    import { MessageSquareMore, Mic } from "lucide-svelte";

    import Drawer from "./Drawer.svelte";
    import DrawerTextInput from "./DrawerTextInput.svelte";
    import DrawerVoiceInput from "./DrawerVoiceInput.svelte";
</script>

<div class="flex justify-center">
    <Drawer>
        {#snippet button()}
            <div
                class="w-24 h-24 bg-blue-500 text-white rounded-l-3xl rounded-r-none shadow-lg
                    hover:bg-blue-600 active:bg-blue-700 active:scale-95 transition-all duration-150 cursor-pointer grid place-items-center"
                aria-label="Activate microphone"
            >
                <Mic size={34} class="block mx-auto" />
            </div>
        {/snippet}
        {#snippet title()}
            Voice Input
        {/snippet} 
        
        <DrawerVoiceInput />
    </Drawer>

    <Drawer>
        {#snippet button()}
            <div
                class="w-24 h-24 bg-gray-100 text-black rounded-r-3xl rounded-l-none shadow-lg hover:bg-gray-200 active:bg-gray-300 active:scale-95 transition-all duration-150 cursor-pointer grid place-items-center"
                aria-label="Open message input"
            >
                <MessageSquareMore size={34} class="block mx-auto" />
            </div>
        {/snippet}
        {#snippet title()}
            Message Input
        {/snippet} 
        
        <DrawerTextInput />
    </Drawer>
</div>