<script>
    import ShopItem from "$lib/components/shop/ShopItem.svelte";
    import ShopCard from "$lib/components/shop/ShopCard.svelte";
    import { Palette, Trophy } from "lucide-svelte";
    import { supabase } from "$lib/supabase";

    const tabs = ["Meetcoins", "Tickets", "Cosmetics", "Agents"];
    let activeTab = $state(0);

    async function loadStore() {
        const { data } = await supabase
            .from("shop_items")
            .select("name, description, price, amount, bonus, tab, duration")
            .order("price", { ascending: true });
        console.log(data);
        
        return data;
    }
</script>

{#await loadStore()}
    LOADING
{:then items}
    <div class="flex gap-5">
        {#each tabs as tab, i}
            <button
            onclick={() => activeTab = i}
            class={`flex items-center gap-1.5 px-4 py-2 rounded-full whitespace-nowrap transition-colors ${
            activeTab === i ? "bg-blue-500 text-white" : "bg-[#f6f5f8] text-gray-500"
            }`}
            >
                <span>{tab}</span>
            </button>
        {/each}
    </div>
    {#each items as item}
        {#if item.tab === activeTab}
            <ShopItem amount={item.amount} price={item.price} description={item.description} bonus={item.bonus}></ShopItem>
        {/if}
    {/each}
{/await}
<!-- 
<ShopItem amount="200" price="4.99€" description="Meetcoins" bonus="100"></ShopItem>
<ShopItem price="100" name="Ranked Ticket" description="Participate in a ranked match">
    {#snippet icon()}
        <div class="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-sm">
            <Trophy class="w-6 h-6 text-blue-500" />
        </div>
    {/snippet}
</ShopItem>
<ShopItem price="100"></ShopItem>

<ShopCard price="200">
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