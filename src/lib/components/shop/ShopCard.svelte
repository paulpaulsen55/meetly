<script lang="ts">
    import { Star } from "lucide-svelte";

    let { price, name = null, bonus = null, icon } = $props();
</script>

<div
    class="bg-white rounded-2xl p-3 border border-[#e5e7eb] shadow-sm flex flex-col"
>
    {@render icon()}
    <p class="font-medium text-sm">{name}</p>
    <div class="flex justify-between items-center mt-1">
        <div class="flex items-center gap-1">
            <Star class="w-3.5 h-3.5 text-blue-500" />
            <span class="text-sm">{price}</span>
        </div>
        {#if name}
            <button class="bg-blue-500 text-white rounded-full px-2 py-1 text-xs">
                buy
            </button>
        {/if}
    </div>
</div>
