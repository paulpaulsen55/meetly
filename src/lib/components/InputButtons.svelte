<script>
    import { Mic, MessageSquareMore } from 'lucide-svelte';
    import { writable } from 'svelte/store';

    const activeButton = writable('mic'); // 'mic' or 'message'

    function setMic() {
        activeButton.set('mic');
    }

    function setMessage() {
        activeButton.set('message');
    }
</script>

<div class="flex justify-center items-center">
    <button class="flex w-40 h-20 rounded-3xl overflow-hidden shadow-lg drop-shadow-xl">
        <!-- Mic Half -->
        <div
            on:click={setMic}
            class="flex-1 flex items-center justify-center transition-colors duration-300"
            class:bg-blue-500={$activeButton === 'mic'}
            class:bg-gray-200={$activeButton !== 'mic'}
        >
            <Mic 
                class={"transition-colors duration-300 " + ($activeButton === 'mic' ? "text-white" : "text-gray-600")} size={30}
            />
        </div>
        <!-- Separator -->
        <div class="border-l border-gray-400"></div>
        <!-- Message Half -->
        <div
            on:click={setMessage}
            class="flex-1 flex items-center justify-center transition-colors duration-300"
            class:bg-blue-500={$activeButton === 'message'}
            class:bg-gray-200={$activeButton !== 'message'}
        >
            <MessageSquareMore 
                class={"transition-colors duration-300 " + ($activeButton === 'message' ? "text-white" : "text-gray-600")} size={30}
            />
        </div>
    </button>
</div>