import { supabase } from '$lib/supabase';
import type { PageLoad } from "./$types";
import { get } from 'svelte/store';
import { user } from '$lib/stores';

export const load: PageLoad = async ({ depends }) => {
    depends("app:ranked");
    
    const currentUser = get(user);
    
    // Get leaderboard data
    const { data: leaderboardData, error: leaderboardError } = await supabase.rpc('get_user_displaynames_and_coins');
    
    // Get current user's badges
    const { data: badgesData, error: badgesError } = await supabase
        .from('user_badges')
        .select('title, description')
        .eq('user_id', currentUser?.id || '')
    
    return { 
        users: leaderboardData || [],
        error: leaderboardError ? leaderboardError.message : '',
        badge: badgesData && badgesData.length > 0 ? badgesData[0] : null,
        badgeError: badgesError ? badgesError.message : ''
    };
};