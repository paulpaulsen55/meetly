import { get } from 'svelte/store';
import { actions, user, userProfile } from './stores'
import { supabase } from './supabase'
import { parseDate, formatISODate } from './date'

/**
 * Loads the user profile and user data
 */
export async function loadProfile() {
  const currentUser = get(user);
  if (!currentUser?.id) return;

  const { data: profileData } = await supabase
      .from('user_profiles')
      .select("displayname, settings")
      .eq('user_id', currentUser.id)
      .single();

  const { data: eventData } = await supabase
      .from('user_events')
      .select("event, is_complete")
  
  const { data: coinsData } = await supabase
      .from('user_coins')
      .select("coins")
      .single()

  if (!profileData) return

  userProfile.set({
    displayname: profileData.displayname,
    events: eventData?.map(row => ({
      ...row.event,
      is_complete: row.is_complete,
    })) ?? [],
    settings: profileData.settings,
    coins: coinsData?.coins ?? 0,
  });
}

export async function loadActions() {
  const { data: actionsData } = await supabase
      .from('actions')
      .select("*")
      .order('coins', { ascending: false });

  actions.set(actionsData || []);
}

export async function insertActionById(actionId: number) {
  const { error } = await supabase
      .from('user_actions')
      .insert({ "action_id" : actionId })
  if (error) {
      console.error("Error inserting event:", error)
  }
}

export async function updateCoinsStore() {
  const { data: coinsData } = await supabase
      .from('user_coins')
      .select("coins")
      .single()

  userProfile.update((profile) => {
      if (profile) profile.coins = coinsData?.coins ?? 0;
      return profile;
  })
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