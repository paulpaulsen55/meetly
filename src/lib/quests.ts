import { get } from 'svelte/store';
import { supabase } from './supabase';
import { user } from './stores';

// Check if user has quest tickets
export async function checkForQuestTicket() {
    const { count, error } = await supabase
        .from('user_items')
        .select('*', { count: 'exact' })
        .eq('item_id', 5);

    const hasTicket = count && count >= 1 && !error ? true : false;
    return hasTicket;
}

// Get all quests for the current user
export async function getAllQuests() {
    const { data: questsData, error } = await supabase
        .from('user_quests')
        .select(`
            *, 
            social_quests(*), 
            initiated:user_profiles!user_quests_initiated_fkey(user_id, displayname),
            friend:user_profiles!user_quests_friend_fkey(user_id, displayname)
        `)

    if (!questsData) return [];

    const currentUserId = get(user)?.id;

    // Format quest data
    const activeQuests = questsData.map(item => {
        return {
            id: item.quest_id,
            title: item.social_quests.title,
            description: item.social_quests.description,
            reward: item.social_quests.prize || 100,
            status: item.status,
            initiated: item.initiated,
            friend: item.friend,
            initiated_completed: item.initiated_completed,
            friend_completed: item.friend_completed,
            isFriend: item.friend.user_id === currentUserId ? true : false,
        };
    });


    return activeQuests;
}

// Create a new quest with a friend
export async function createQuest(friendId: string) {
    const { error } = await supabase.rpc('create_friend_quest', { friend_id: friendId })

    if (error) return { error: error.message };

    await Promise.all([
        checkForQuestTicket(),
        getAllQuests()
    ]);
}

export async function confirmQuest(questId: number) {
    await supabase.from('user_quests')
        .update({ status: 'in_progress' })
        .eq('quest_id', questId);
}