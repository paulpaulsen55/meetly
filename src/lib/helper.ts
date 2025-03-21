import { userProfile } from './auth'
import { supabase } from './supabase'
import { parseDate, formatISODate } from './date'
import { get } from 'svelte/store'

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