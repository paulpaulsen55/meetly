import { get } from 'svelte/store';
import { supabase } from './supabase';
import { user } from './stores';

// Fetch all users excluding current user
export async function loadUsersAndFriends() {
    const { data: otherUsers, error } = await supabase.rpc('get_users_and_friends');

    return otherUsers || [];
}

export async function loadFriendsCount() {
    const { count } = await supabase
        .from('social_friends')
        .select('*', { count: 'exact' })
        .eq('user_id', get(user)?.id);

    return count || 0;
}

// Add a friendship between current user and another user
export async function addFriend(friendId: string) {
    const { error } = await supabase
        .from('social_friends')
        .insert({
            user_id: get(user)?.id,
            friends_id: friendId
        });
    if (error) throw Error("Failed to add friend");
}
