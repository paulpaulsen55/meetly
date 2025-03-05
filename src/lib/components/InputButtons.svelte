<script>
    import { Mic, MessageSquareMore } from 'lucide-svelte';
    
    let activeButton = 'mic'; // 'mic' or 'message'

    function toggleActiveButton() {
    activeButton = activeButton === 'mic' ? 'message' : 'mic';
    }
</script>

<div class="flex space-x-2">
    <button 
    class={`flex-1 p-3 rounded-lg ${activeButton === 'mic' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
    on:click={toggleActiveButton}
    >
    <Mic/>
    </button>
    <button 
    class={`flex-1 p-3 rounded-lg ${activeButton === 'message' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'}`}
    on:click={toggleActiveButton}
    >
    <MessageSquareMore/>
    </button>
</div>