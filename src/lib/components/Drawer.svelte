<script lang="ts">
    import { X } from "lucide-svelte";
    import { fly } from "svelte/transition";
    import { cubicOut } from "svelte/easing";
    import { onMount, createEventDispatcher } from "svelte";
    
    // Mark isOpen as bindable (using Svelte runes here)
    let { children, button, title, isOpen = $bindable(false) } = $props();

    // Create a dispatcher so we can notify when the drawer is closed
    const dispatch = createEventDispatcher();

    // Drag gesture variables
    let startY = $state(0);
    let currentY = $state(0);
    let dragging = $state(false);
    let drawerElement: HTMLElement | null = $state(null);
    let drawerHeight = $state(0);
    let drawerTransform = $state(0);

    // Add event listeners for drag on component mount
    onMount(() => {
        // Add passive event listeners for performance
        document.addEventListener("mousemove", handleDrag, { passive: true });
        document.addEventListener("mouseup", handleDragEnd);
        document.addEventListener("touchmove", handleDrag, { passive: true });
        document.addEventListener("touchend", handleDragEnd);

        // Clean up event listeners on component destroy
        return () => {
            document.removeEventListener("mousemove", handleDrag);
            document.removeEventListener("mouseup", handleDragEnd);
            document.removeEventListener("touchmove", handleDrag);
            document.removeEventListener("touchend", handleDragEnd);
        };
    });

    function openDrawer() {
        isOpen = true;
        document.body.classList.add("drawer-open");
        setTimeout(() => {
            if (drawerElement) {
                drawerHeight = drawerElement.offsetHeight;
            }
        }, 50);
    }

    function closeDrawer() {
        isOpen = false;
        drawerTransform = 0;
        // Dispatch the close event so the parent resets its state
        dispatch('close');
        setTimeout(() => {
            document.body.classList.remove("drawer-open");
        }, 300);
    }

    function handleDragStart(event: MouseEvent | TouchEvent) {
        // If we're interacting with form elements, don't start dragging
        if (!drawerElement) return;

        // Don't capture on form elements
        if (event.target instanceof Element) {
            const tagName = event.target.tagName.toLowerCase();
            if (["input", "textarea", "button", "select"].includes(tagName)) {
                return;
            }
        }

        dragging = true;
        startY = event.type.includes("mouse")
            ? (event as MouseEvent).clientY
            : (event as TouchEvent).touches[0].clientY;
        drawerElement.style.transition = "none";
    }

    function handleDrag(event: MouseEvent | TouchEvent) {
        if (!dragging || !drawerElement) return;

        const clientY = event.type.includes("mouse")
            ? (event as MouseEvent).clientY
            : (event as TouchEvent).touches[0].clientY;
        currentY = clientY - startY;

        // Only allow dragging down, not up
        if (currentY < 0) currentY = 0;

        drawerTransform = currentY;
        drawerElement.style.transform = `translateY(${currentY}px)`;
    }

    function handleDragEnd() {
        if (!dragging || !drawerElement) return;

        dragging = false;
        drawerElement.style.transition =
            "transform 0.3s cubic-bezier(0.25, 1, 0.5, 1)";

        // If dragged more than 25% of drawer height, close it
        if (currentY > drawerHeight * 0.25) {
            closeDrawer();
        } else {
            // Otherwise snap back
            drawerTransform = 0;
            drawerElement.style.transform = "";
        }
    }
</script>

<div>
    <button onclick={openDrawer} >
        {@render button()}
    </button>

    {#if isOpen}
        <!-- Overlay that pushes main content back -->
        <div
            role="button"
            aria-label="Close drawer"
            tabindex="0"
            class="fixed inset-0 bg-black/20 z-40"
            onkeydown={(e) => e.key === 'Enter' && closeDrawer()}
            onclick={closeDrawer}
            in:fly={{ duration: 200, opacity: 0 }}
            out:fly={{ duration: 200, opacity: 0 }}
        ></div>

        <div
            role="button"
            tabindex="0"
            bind:this={drawerElement}
            class="fixed inset-x-0 bottom-0 h-1/3 bg-white shadow-lg rounded-t-3xl z-50 touch-pan-y"
            in:fly={{ y: 500, duration: 300, easing: cubicOut }}
            out:fly={{ y: 500, duration: 300, easing: cubicOut }}
            onmousedown={handleDragStart}
            ontouchstart={handleDragStart}
        >
            <!-- Drag handle -->
            <div
                class="w-12 h-1 bg-gray-300 rounded-full mx-auto mt-2 mb-1 cursor-grab"
                role="button"
                aria-label="Drag handle"
            ></div>

            <!-- Header with close button -->
            <div class="flex justify-between items-center px-4 pb-2 border-b border-gray-300">
                <h3 class="text-lg font-semibold m-0">
                    {@render title()}
                </h3>
                <button
                    onclick={closeDrawer}
                    class="p-1 hover:bg-gray-100 rounded-full cursor-pointer"
                    aria-label="Close drawer"
                >
                    <X size={24} />
                </button>
            </div>

            <!-- Drawer Content -->
            <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
            <div
                class="p-4 h-[calc(100%-60px)] overflow-y-auto"
                role="region"
                aria-label="Drawer content"
                onmousedown={(e) => e.stopPropagation()}
                ontouchstart={(e) => e.stopPropagation()}
            >
                {@render children?.()}
            </div>
        </div>
    {/if}
</div>


<style>
    :global(body.drawer-open) {
        overflow: hidden;
    }

    :global(body.drawer-open .app-content) {
        transform: scale(0.95) translateY(-5%);
        transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        border-radius: 16px;
        overflow: hidden;
    }

    :global(.app-content) {
        transition: transform 0.3s cubic-bezier(0.25, 1, 0.5, 1);
        transform-origin: center;
    }
</style>
