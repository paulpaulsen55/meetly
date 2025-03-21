import { userProfile } from './auth'
import { supabase } from './supabase'

/**
 * Loads the user profile and user data
 */
export async function loadProfile() {
    const { data: profileData } = await supabase
        .from('user_profiles')
        .select("displayname, settings")
        .single();

    const { data: streakData } = await supabase
        .from('user_streaks')
        .select("streak, updated_at")
        .single();
  
    const { data: eventData } = await supabase
        .from('user_events')
        .select("event, id")

    if (!profileData) return

    userProfile.set({
        displayname: profileData.displayname,
        events: eventData ? eventData.map(e => e.event) : [],
        settings: profileData.settings,
        streak: streakData ?? { streak: 0, updated_at: '' },
    });
}