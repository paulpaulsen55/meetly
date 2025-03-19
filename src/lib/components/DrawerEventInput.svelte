<script lang="ts">
    import { supabase } from "$lib/supabase";
    import { loadProfile } from "$lib/helper";

    let eventDate = $state("");
    let eventTitle = $state("");
    let loading = $state(false);
    let errorMessage = $state("");
    let successMessage = $state("");

    async function handleSubmit(event: Event) {
        event.preventDefault();
        loading = true;
        errorMessage = "";
        successMessage = "";

        try {
            if (!eventDate.trim() || !eventTitle.trim()) {
                errorMessage = "Please fill in both date and title fields";
                return;
            }

            const newEvent = {
                date: eventDate,
                title: eventTitle
            };

            const { error } = await supabase
                .from('user_events')
                .insert({
                    event: newEvent
                });

            if (error) throw error;

            eventDate = "";
            eventTitle = "";
            successMessage = "Event added successfully!";
            
            await loadProfile();
        } catch (error) {
            console.error("Error adding event:", error);
            errorMessage = "Failed to add event. Please try again.";
        } finally {
            loading = false;
        }
    }
</script>

<div class="text-center">
    <form
        class="flex flex-col gap-3"
        onsubmit={handleSubmit}
    >
        <div class="form-group">
            <label for="event-date" class="block text-sm font-medium text-gray-700 mb-1 text-left">Date</label>
            <input
                id="event-date"
                type="date"
                bind:value={eventDate}
                aria-label="Event date"
                class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
            />
        </div>
        
        <div class="form-group">
            <label for="event-title" class="block text-sm font-medium text-gray-700 mb-1 text-left">Title</label>
            <input
                id="event-title"
                type="text"
                placeholder="Event title"
                bind:value={eventTitle}
                aria-label="Event title"
                class="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={loading}
            />
        </div>
        
        <button
            type="submit"
            class={`mt-2 px-4 py-2 cursor-pointer ${loading ? "bg-gray-500" : "bg-blue-500 hover:bg-blue-600"} text-white rounded-lg transition-colors duration-300`}
            disabled={loading}
        >
            {loading ? "Adding..." : "Add Event"}
        </button>
    </form>

    {#if errorMessage}
        <div class="mt-4 p-2 rounded border bg-red-100 text-red-800 border-red-200" role="alert">
            {errorMessage}
        </div>
    {/if}

    {#if successMessage}
        <div class="mt-4 p-2 rounded border bg-green-100 text-green-800 border-green-200" role="status">
            {successMessage}
        </div>
    {/if}
</div>