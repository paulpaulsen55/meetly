import { get } from 'svelte/store';
import { supabase } from './supabase';
import { user, userProfile, quests, type Quest } from './stores';

// Helper for common error handling pattern
const handleError = (err: unknown) => err instanceof Error ? err.message : 'An error occurred';

// Check if user has quest tickets
export async function checkForQuestTicket() {
    try {
        const { data, error } = await supabase
            .from('user_items')
            .select('*')
            .eq('item_id', 5);
        
        const hasTicket = !!data && data.length > 0 && !error;
        quests.update(state => ({ ...state, hasTicket }));
        
        return hasTicket;
    } catch (err) {
        console.error("Error checking for quest ticket:", err);
        return false;
    }
}

// Load all active quests for the current user
export async function loadActiveQuests() {
    const currentUserId = get(userProfile)?.user_id || get(user)?.id;
    if (!currentUserId) {
        console.log("User profile not loaded yet, skipping quest loading");
        return [];
    }
    
    quests.update(state => ({ ...state, loading: true }));
    
    try {
        // Get user's active quests
        const { data: questsData, error: questsError } = await supabase
            .from('user_quests')
            .select(`quest_id, user1, user2, status`)
            .or(`user1.eq.${currentUserId},user2.eq.${currentUserId}`)
            .eq('status', 'active');
        
        if (questsError) throw questsError;
        
        if (!questsData?.length) {
            quests.update(state => ({ ...state, activeQuests: [], loading: false }));
            return [];
        }

        // Get quest templates and friend profiles in parallel
        const [templateResponse, profileResponse] = await Promise.all([
            supabase.from('social_quests').select('*'),
            supabase.from('user_profiles')
                .select('user_id, displayname')
                .in('user_id', questsData.map(quest => 
                    quest.user1 === currentUserId ? quest.user2 : quest.user1
                ))
        ]);
        
        if (templateResponse.error) throw templateResponse.error;
        if (profileResponse.error) throw profileResponse.error;
        
        // Create lookup maps
        const friendMap = Object.fromEntries(
            (profileResponse.data || []).map(profile => [profile.user_id, profile.displayname])
        );
        
        const questMap = Object.fromEntries(
            (templateResponse.data || []).map(template => [template.id, template])
        );
        
        // Format quest data
        const activeQuests = questsData.map(item => {
            const questTemplate = questMap[item.quest_id] || {
                title: "Mystery Quest",
                description: "Details unavailable",
                prize: 100
            };
            
            const friendId = item.user1 === currentUserId ? item.user2 : item.user1;
            
            return {
                id: item.quest_id,
                title: questTemplate.title,
                description: questTemplate.description,
                reward: questTemplate.prize || 100,
                status: item.status as 'active' | 'completed' | 'available',
                participants: [currentUserId, friendId],
                friend_name: friendMap[friendId] || 'friend',
                initiated: item.user1 === currentUserId
            };
        });
        
        quests.update(state => ({ ...state, activeQuests, loading: false }));
        return activeQuests;
    } catch (err) {
        quests.update(state => ({ ...state, error: handleError(err), loading: false }));
        console.error("Error loading quests:", err);
        return [];
    }
}

// Create a new quest with a friend
export async function createQuestWithFriend(friendId: string) {
    const { data: authUser } = await supabase.auth.getUser();
    const currentUserId = get(userProfile)?.user_id || authUser?.user?.id;
    
    if (!currentUserId) return { success: false, error: "Not authenticated" };
    
    try {
        // Check for existing quests (both user and friend) in parallel
        const [userQuestsResponse, friendQuestsResponse] = await Promise.all([
            supabase.from('user_quests')
                .select('*')
                .or(`user1.eq.${currentUserId},user2.eq.${currentUserId}`)
                .eq('status', 'active'),
            supabase.from('user_quests')
                .select('*')
                .or(`user1.eq.${friendId},user2.eq.${friendId}`)
                .eq('status', 'active')
        ]);
        
        if (userQuestsResponse.error) throw userQuestsResponse.error;
        if (friendQuestsResponse.error) throw friendQuestsResponse.error;
        
        if (userQuestsResponse.data?.length) {
            return { success: false, error: 'You already have an active quest' };
        }
        
        if (friendQuestsResponse.data?.length) {
            return { success: false, error: 'Your friend already has an active quest' };
        }
        
        // Get quest templates
        const { data: questTemplates, error: questError } = await supabase
            .from('social_quests').select('*');
        
        if (questError) throw questError;
        if (!questTemplates?.length) return { success: false, error: 'No quest templates available' };
        
        // Select random quest and create it
        const randomQuest = questTemplates[Math.floor(Math.random() * questTemplates.length)];
        
        const { data: newQuest, error: insertError } = await supabase
            .from('user_quests')
            .insert({
                quest_id: randomQuest.id,
                user1: currentUserId,
                user2: friendId,
                status: 'active'
            })
            .select()
            .single();
        
        if (insertError) throw insertError;
        
        // Use one ticket - but don't stop if this fails
        await supabase
            .from('user_items')
            .delete()
            .eq('item_id', 5)
            .eq('user_id', currentUserId)
            .then(result => {
                if (result.error) console.error("Error deleting quest ticket:", result.error);
            });
        
        // Update stores and select the quest
        const newQuestData: Quest = {
            id: randomQuest.id,
            title: randomQuest.title,
            description: randomQuest.description,
            reward: randomQuest.prize || 100,
            status: 'active',
            participants: [currentUserId, friendId]
        };
        
        // Run these operations in parallel
        await Promise.all([
            checkForQuestTicket(),
            loadActiveQuests()
        ]);
        
        selectQuest(newQuestData);
        return { success: true, quest: newQuestData };
    } catch (err) {
        return { success: false, error: handleError(err) };
    }
}

// Quest management functions
export function selectQuest(quest: Quest) {
    quests.update(state => ({ ...state, selectedQuest: quest }));
}

export function clearSelectedQuest() {
    quests.update(state => ({ ...state, selectedQuest: null }));
}

// Initialize quests data
export async function initializeQuests() {
    await Promise.all([checkForQuestTicket(), loadActiveQuests()]);
}