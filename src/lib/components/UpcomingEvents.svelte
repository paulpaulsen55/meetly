<script>
    let events = [
      { id: 1, text: '@Morgen Mom besuchen', icon: 'info' },
      { id: 2, text: '@29.02.25 Klopapier kaufen', icon: 'info' },
      { id: 3, text: '@69.69.69 Treffen im Park', icon: 'clock' }
    ];
</script>

<div class="mb-4">
    <h2 class="text-lg font-semibold mb-2">Upcoming</h2>
    {#each events as event}
        <div class="flex items-center justify-between bg-gray-100 p-3 rounded-lg mb-2">
        <span class="text-sm">{event.text}</span>
        <button>
            {#if event.icon === 'info'}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
            {:else}
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clip-rule="evenodd" />
            </svg>
            {/if}
        </button>
        </div>
    {/each}
</div>