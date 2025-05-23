<script>
    import { ShoppingBasket, Star } from "lucide-svelte";
    import { userProfile } from "$lib/stores";
</script>

<div class="bg-gradient-to-br from-blue-500/5 to-blue-500/20 rounded-3xl p-5 shadow-sm borderborder-gray-200 flex flex-col justify-between">
    <div>
        <p class="text-gray-500 text-sm font-medium mb-1">MEETCOINS</p>
        <div class="flex items-center gap-2">
            <div class="w-12 h-12 rounded-full bg-blue-500 flex items-center justify-center">
                <Star class="w-6 h-6 text-white" />
            </div>
            <div>
                <p class="text-4xl font-bold text-black">
                    {$userProfile?.coins}
                </p>
                <p class="text-gray-500 text-xs">Available to spend</p>
            </div>
        </div>
    </div>

    <div class="mt-3">
        <a
            href="/app/shop"
            class="w-full bg-blue-500 text-white rounded-full py-2 px-4 flex items-center justify-center gap-1 text-sm shadow-sm"
        >
            <ShoppingBasket class="w-4 h-4" />
            <span>Shop</span>
        </a>
    </div>
</div>