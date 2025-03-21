import { userProfile } from './auth'
import { supabase } from './supabase'
import { parseDate, formatISODate } from './date'
import { get } from 'svelte/store'

/**
 * Loads the user profile and user data
 */
export async function loadProfile() {
    const { data: user } = await supabase.auth.getUser();
    const userId = user?.user?.id;
    
    if (!userId) return;

    const { data: profileData } = await supabase
        .from('user_profiles')
        .select("displayname, settings")
        .eq('user_id', userId)
        .maybeSingle();

    const { data: streakData } = await supabase
        .from('user_streaks')
        .select("streak, updated_at")
        .eq('user_id', userId)
        .maybeSingle();
  
    const { data: eventData } = await supabase
        .from('user_events')
        .select("event, id")
        .eq('user_id', userId);

    if (!profileData) return;

    userProfile.set({
        displayname: profileData.displayname,
        events: eventData ? eventData.map(e => e.event) : [],
        settings: profileData.settings,
        streak: streakData ?? { streak: 0, updated_at: '' },
    });
}

/**
 * Add an event to the database
 * @param eventData The event data (can be raw date string or already formatted)
 * @returns Object with success status and any error message
 */
export async function addEvent(eventData: { date: string, title: string }) {
    try {
        // Validate the date
        if (!eventData.date) {
            throw new Error("No date found in event");
        }
        
        // Parse the date if it's not already in ISO format
        if (!eventData.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
            const parsedDate = parseDate(eventData.date);
            if (!parsedDate) {
                throw new Error(`Invalid date format: ${eventData.date}`);
            }
            
            // Convert to ISO format (YYYY-MM-DD)
            eventData.date = formatISODate(parsedDate);
        }
        
        // Save validated event to database
        const { error: dbError } = await supabase
            .from('user_events')
            .insert({
                event: eventData,
            });
        
        if (dbError) {
            throw dbError;
        }

        // Refresh the profile data
        await loadProfile();

        return { success: true };
    } catch (error) {
        console.error("Error adding event:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to add event" 
        };
    }
}

/**
 * Fetches all users from the database
 * @returns Object with success status, error message if any, and array of user profiles
 */
export async function getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('displayname');
      
      if (error) {
        console.error("Error fetching displaynames:", error.message);
        return { 
          success: false, 
          error: error.message, 
          users: [] 
        };
      }
      
      // Filter out the current user
      const currentProfile = get(userProfile);
      const currentUsername = currentProfile?.displayname;
      
      if (!currentUsername) {
        return { 
          success: true, 
          users: data || [] 
        };
      }
      
      const otherUsers = data?.filter(user => 
        user.displayname !== currentUsername
      ) || [];
      
      console.log(`Filtered users: ${otherUsers.length} of ${data?.length || 0} total`);
      
      return { 
        success: true, 
        users: otherUsers 
      };
    } catch (error) {
      console.error("Error fetching users:", error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Failed to fetch users",
        users: []
      };
    }
}