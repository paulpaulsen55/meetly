<script lang="ts">
    import { Star } from "lucide-svelte";

    let {
        amount = null,
        name = null,
        bonus = null, 
        price = "",
        duration = null,
        description = null,
        icon = null,
    } = $props();

    let realMoney = price.toString().endsWith('€');
</script>

<div
    class="bg-gradient-to-br from-[#f6f5f8] to-[#f0f0f3] rounded-2xl p-4 border border-[#e5e7eb] shadow-sm"
>
    <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
        {#if icon}
            {@render icon()}
        {:else}
            <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <Star class="w-6 h-6 text-white" />
            </div>
        {/if}
        <div>
        <div class="flex items-center gap-1.5">
            <p class="text-xl font-bold">{amount} {name}</p>
            {#if bonus}
                <span class="text-xs bg-blue-500 text-white px-3 py-0.5 rounded-full">+ {bonus} bonus</span>
            {/if}
        </div>
        <p class="text-gray-500 text-sm">{description}</p>
        {#if !realMoney}
            <div class="flex items-center">
                <Star class="w-4 h-4 text-blue-500" />
                <p class="">{price}</p>
            </div>
        {/if}
        </div>
    </div>
    {#if realMoney}
        <button class="bg-blue-500 text-white rounded-full px-4 py-2 font-medium">{price}</button>
    {:else}
        <button class="bg-blue-500 text-white rounded-full px-4 py-2 font-medium">purchase</button>
    {/if}
    </div>
</div>