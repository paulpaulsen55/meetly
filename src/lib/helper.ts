import { get } from 'svelte/store'
import { userProfile } from './auth'
import { supabase } from './supabase'

/**
 * Loads the user profile and user data
 */
export async function loadProfile() {
    const currentProfile = get(userProfile);
    if (!currentProfile || !currentProfile.displayname) {
        const { data: profileData } = await supabase
            .from('user_profiles')
            .select("displayname, settings")
            .single();
    
        const { data: streakData } = await supabase
            .from('user_streaks')
            .select("streak, updated_at")
            .single();

        if (!profileData) return

        userProfile.set({
            displayname: profileData.displayname,
            settings: profileData.settings,
            streak: streakData ?? { streak: 0, updated_at: '' },
        });
    }
}