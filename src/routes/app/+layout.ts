import { goto } from "$app/navigation";
import { user, userProfile } from "$lib/auth";
import { supabase } from "$lib/supabase";


/**
 * Protects the /app/* routes
 * Loads the user profile and user data
 */
export async function load() {
    let profile: any = null;
    userProfile.subscribe((v) => profile = v)
    let userData = null;
    user.subscribe((v) => userData = v)


    if (!userData) return goto("/")

    if (profile != null && profile.displayname) return

    const { data: profileData } = await supabase.from('user_profiles').select("displayname, settings").single()
    const { data: streakData } = await supabase.from('user_streaks').select("streak").single()

    if (!profileData || !streakData) return

    userProfile.set({
        displayname: profileData.displayname,
        settings: profileData.settings,
        streak: streakData.streak,
    })
}
