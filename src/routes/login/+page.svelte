<script lang="ts">
    import { supabase } from "$lib/supabase";
    import { goto } from "$app/navigation";
    import { ChevronLeft } from "lucide-svelte";

    let email = $state("");
    let password = $state("");
    let loading = $state(false);
    let errorMessage = $state("");

    async function handleLogin(event: Event) {
        event.preventDefault();
        try {
            loading = true;
            errorMessage = "";

            const { error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            goto("/app/home");
        } catch (error) {
            errorMessage = error as string;
        } finally {
            loading = false;
        }
    }
</script>

<div class="min-h-screen flex items-center justify-center bg-gradient">
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1
            class="text-3xl font-bold text-center mb-6 flex items-center justify-center"
        >
            <a href="/">
                <ChevronLeft size={35} />
            </a>
            <span>Login to your account<span> </span></span>
        </h1>
        {#if errorMessage}
            <div class="error">{errorMessage}</div>
        {/if}
        <form onsubmit={handleLogin} class="flex flex-col gap-4">
            <div class="form-group">
                <label for="email">E-Mail</label>
                <input
                    id="email"
                    type="email"
                    class="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    bind:value={email}
                    required
                    disabled={loading}
                />
            </div>
            <div class="form-group">
                <label for="password">Password</label>
                <input
                    id="password"
                    type="password"
                    class="shadow-sm rounded-md w-full px-3 py-2 border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    bind:value={password}
                    required
                    minlength="6"
                    disabled={loading}
                />
            </div>
            <button
                type="submit"
                disabled={loading}
                class="w-full text-center py-2 px-4 rounded bg-blue-500 text-white font-bold hover:bg-blue-600 transition-colors"
            >
                {loading ? "Loading..." : "Login"}
            </button>
        </form>
    </div>
</div>

<style>
    .bg-gradient {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }
</style>
