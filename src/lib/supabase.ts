import { createClient } from '@supabase/supabase-js'    
import { get } from 'svelte/store'
import { userProfile } from './auth'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)


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