import { get } from 'svelte/store';
import { supabase } from './supabase';
import { user, friends } from './stores';

// Fetch all users excluding current user
export async function fetchUsers() {
    friends.update(s => ({ ...s, loading: true, error: null }));
    
    try {
        const { data, error } = await supabase
            .from('user_profiles')
            .select('displayname, user_id');
        
        if (error) throw error;
        
        // Filter out the current user
        const currentUserId = get(user)?.id;
        const otherUsers = data?.filter(user => user.user_id !== currentUserId) || [];
        
        friends.update(s => ({ 
            ...s, 
            users: otherUsers,
            loading: false 
        }));
        
        return otherUsers;
    } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Failed to fetch users';
        friends.update(s => ({ ...s, loading: false, error: errorMsg }));
        console.error("Error fetching users:", error);
        return [];
    }
}

// Load friend count and existing friends
export async function loadFriends() {
    const currentUserId = get(user)?.id;
    if (!currentUserId) return;
    
    try {
        // Get friend count and list in one call
        const { data: friendships, error, count } = await supabase
            .from('social_friends')
            .select('user_id, friends_id', { count: 'exact' })
            .or(`user_id.eq.${currentUserId},friends_id.eq.${currentUserId}`);
            
        if (error) throw error;
        
        // Extract friend IDs
        const friendIds = new Set<string>();
        friendships?.forEach(friendship => {
            const otherId = friendship.user_id === currentUserId 
                ? friendship.friends_id 
                : friendship.user_id;
            friendIds.add(otherId);
        });
        
        friends.update(s => ({ 
            ...s, 
            friendIds,
            friendCount: count || 0 
        }));
    } catch (error) {
        console.error("Error loading friendships:", error);
    }
}

// Add a friendship between current user and another user
export async function addFriend(friendId: string) {
    const currentUserId = get(user)?.id;
    if (!currentUserId) {
        return { success: false, error: "You must be logged in to add friends" };
    }
    
    // Mark request as pending
    friends.update(s => {
        const pendingRequests = new Set(s.pendingRequests);
        pendingRequests.add(friendId);
        return { ...s, pendingRequests };
    });
    
    try {
        // Check if already friends (shouldn't happen with UI disabling, but good practice)
        const { data: existingFriend, error: checkError } = await supabase
            .from('social_friends')
            .select('*')
            .or(`and(user_id.eq.${currentUserId},friends_id.eq.${friendId}),and(user_id.eq.${friendId},friends_id.eq.${currentUserId})`)
            .maybeSingle();
            
        if (checkError) throw checkError;
        
        if (!existingFriend) {
            // Create new friendship
            const { error: insertError } = await supabase
                .from('social_friends')
                .insert({
                    user_id: currentUserId,
                    friends_id: friendId
                });
                
            if (insertError) throw insertError;
        }
        
        // Update local state
        friends.update(s => {
            const friendIds = new Set(s.friendIds);
            friendIds.add(friendId);
            
            const pendingRequests = new Set(s.pendingRequests);
            pendingRequests.delete(friendId);
            
            return { 
                ...s,
                friendIds,
                friendCount: s.friendCount + (existingFriend ? 0 : 1),
                pendingRequests
            };
        });
        
        return { success: true };
    } catch (error) {
        // Clear pending state
        friends.update(s => {
            const pendingRequests = new Set(s.pendingRequests);
            pendingRequests.delete(friendId);
            return { ...s, pendingRequests };
        });
        
        console.error("Error adding friend:", error);
        return { 
            success: false, 
            error: error instanceof Error ? error.message : "Failed to add friend" 
        };
    }
}

// Initialize friends data
export async function initializeFriends() {
    friends.update(s => ({ ...s, loading: true }));
    
    await Promise.all([
        fetchUsers(),
        loadFriends()
    ]);
    
    friends.update(s => ({ ...s, loading: false }));
}