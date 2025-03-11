import { user, userProfile } from "$lib/auth";
import { supabase } from "$lib/supabase";
import { redirect } from "@sveltejs/kit";
import { get } from "svelte/store";

/**
 * Protects the /app/* routes
 * Loads the user profile and user data
 */
export async function load() {
    user.subscribe((value) => {
        if (!value) {
            redirect(302, '/');
        }
    });

    const currentProfile = get(userProfile);
    if (!currentProfile || !currentProfile.displayname) {
        const { data: profileData } = await supabase
            .from('user_profiles')
            .select("displayname, settings")
            .single();
    
        const { data: streakData } = await supabase
            .from('user_streaks')
            .select("streak")
            .single();

        if (!profileData) return

        userProfile.set({
            displayname: profileData.displayname,
            settings: profileData.settings,
            streak: streakData ? streakData.streak : 0,
        });
    }
}
