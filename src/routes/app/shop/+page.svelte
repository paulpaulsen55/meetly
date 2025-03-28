<script lang="ts">
    import ShopItem from "$lib/components/shop/ShopItem.svelte";
    import ShopCard from "$lib/components/shop/ShopCard.svelte";
    import { supabase } from "$lib/supabase";
    import { updateCoinsStore } from "$lib/helper";
    import { ArrowLeft, Star } from "lucide-svelte";
    import { userProfile } from "$lib/stores";

    const tabs = ["Meetcoins", "Tickets", "Cosmetics", "Agents"];
    let activeTab = $state(0);

    async function loadStore() {
        const { data } = await supabase
            .from("shop_items")
            .select("*")
            .order("price", { ascending: true });
        
        return data;
    }

    async function buyItem(item) {
        console.log("buying item", item);
        
        const { error } = await supabase
            .from("user_items")
            .insert({
                item_id: item.id,
            })
        if (error) alert(`Error buying item: ${error}`);

        await updateCoinsStore();
    }
</script>

<div class="max-w-md mx-auto h-screen flex flex-col overflow-hidden relative rounded-3xl border border-gray-200 shadow-lg">
    <div class="px-5 py-4 flex items-center justify-between border-b border-gray-200">
        <a
        href="/app/home"
        class="w-10 h-10 rounded-fullbg-gray-100 flex items-center justify-center"
        >
            <ArrowLeft className="w-5 h-5 text-black" />
        </a>
        <h1 class="text-xl font-bold text-center">Shop</h1>
        <div class="flex items-center gap-1 bg-[#f6f5f8] rounded-full px-3 py-1.5">
            <Star class="w-4 h-4 text-blue-500" />
            <span class="font-medium">{$userProfile?.coins}</span>
        </div>
    </div>

    <div class="flex gap-5 m-5 overflow-x-auto">
        {#each tabs as tab, i}
            <button
            onclick={() => activeTab = i}
            class={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            activeTab === i ? "bg-blue-500 text-white" : "bg-gray-100 text-gray-500"
            }`}
            >
                <span>{tab}</span>
            </button>
        {/each}
    </div>

    {#await loadStore()}
        LOADING
    {:then items}
        <div class="grid gap-5 px-4 py-3">
            {#each items as item}
                {#if item.tab === activeTab}
                    <ShopItem onbuy={() => buyItem(item)} item={item} icon={item.icon}>
                    </ShopItem>
                {/if}
            {/each}
        </div>
    {/await}

    <div class="px-5 py-4 border-t border-gray-200 w-full flex text-center mt-auto">
        <a href="/app/home" class="w-full bg-blue-500 text-white rounded-full py-3 font-medium">
            Back to App
        </a>
    </div>
</div>

<!-- <ShopCard price="200">
    {#snippet icon()}
        <div
            class="w-full aspect-square rounded-xl mb-2 flex items-center justify-center"
            style={`background: ${"#9c27b0"}20`}
        >
            <div
                class="w-12 h-12 rounded-full"
                style={`background: ${"#9c27b0"}`}
            >
                <Palette class="w-full h-full p-2.5 text-white" />
            </div>
        </div>
    {/snippet}
</ShopCard> -->