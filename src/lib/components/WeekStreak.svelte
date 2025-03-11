<script>
    let days = ['M', 'T', 'W', 'D', 'F', 'S'];
    let activeDay = 0; // Monday
</script>
  
<div class="bg-gray-50 rounded-3xl p-4 flex justify-between mb-4">
    {#each days as day, index}
        <div class={`w-10 h-10 flex items-center justify-center rounded-full 
        ${index === activeDay ? 'bg-blue-500 text-white' : 'text-gray-400'}`}>
        {day}
        </div>
    {/each}
</div>