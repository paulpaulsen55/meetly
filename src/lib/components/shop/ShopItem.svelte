<script lang="ts">
    import type { ShopItemRow } from "$lib/database";
    import { Star } from "lucide-svelte";

    let {
        item = {} as ShopItemRow,
        icon = null as null | string,
        onbuy = () => {},
    } = $props();

    const realMoney = item.price?.toString().endsWith('€');
</script>

<div
    class="bg-gradient-to-br from-[#f6f5f8] to-[#f0f0f3] rounded-2xl p-4 border border-[#e5e7eb] shadow-sm"
>
    <div class="flex items-center justify-between">
    <div class="flex items-center gap-3">
        {#if icon}
            {#await import(`lucide-svelte`).then(module => module[icon]) then Icon}
                <div class={`w-12 h-12 shadow-sm rounded-full bg-white flex items-center justify-center ${icon}`}>
                    <Icon class="w-6 h-6" />
                </div>
            {/await}
        {:else}
            <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <Star class="w-6 h-6 text-white" />
            </div>
        {/if}
        <div>
        <div class="flex items-center gap-1.5">
            <p class="text-xl font-bold">{item.amount} {item.name}</p>
                {#if item.bonus}
                    <span class="text-xs bg-blue-500 text-white px-3 py-0.5 rounded-full">+ {item.bonus} bonus</span>
                {/if}
        </div>
        <p class="text-gray-500 text-sm">{item.description}</p>
        {#if !realMoney}
            <div class="flex items-center">
                <Star class="w-4 h-4 text-blue-500" />
                <p class="">{item.price}</p>
            </div>
        {/if}
        </div>
    </div>
        <button 
            type="button"
            class="bg-blue-500 text-white rounded-full px-4 py-2 font-medium" 
            onclick={() => {onbuy()}}
        >
            {#if realMoney}
                {item.price}
            {:else}
                purchase
            {/if}
        </button>
    </div>
</div>

<style lang="postcss">
    @reference "tailwindcss";

    .Sparkles {
        @apply text-purple-700;
    }
    .Trophy {
        @apply text-blue-500;
    }
    .Zap {
        @apply text-yellow-500;
    }
    .Users {
        @apply text-green-500;
    }
</style>