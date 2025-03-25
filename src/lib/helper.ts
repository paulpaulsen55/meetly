import { get } from 'svelte/store';
import { actions, user, userProfile } from './stores'
import { supabase } from './supabase'

/**
 * Loads the user profile and user data
 */
export async function loadProfile() {
    const { data: profileData } = await supabase
        .from('user_profiles')
        .select("displayname, settings")
        .eq('user_id', get(user)?.id)
        .single();
  
    const { data: eventData } = await supabase
        .from('user_events')
        .select("event")
    
    const { data: coinsData } = await supabase
        .from('user_coins')
        .select("coins")
        .single()

    if (!profileData) return

    userProfile.set({
        displayname: profileData.displayname,
        events: eventData?.map(event => JSON.parse(event.event)) ?? [],
        settings: profileData.settings,
        coins: coinsData?.coins ?? 0
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