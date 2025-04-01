import { get } from 'svelte/store';
import { supabase } from './supabase';
import { user, userProfile, quests } from './stores';
import type { Quest } from './database'

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

// Load the active quests for the current user
export async function loadActiveQuests() {
    const currentUserId = get(user)?.id;

    const { data: questsData } = await supabase
        .from('user_quests')
        .select(`*, social_quests(*)`);
    
    if (!questsData) {
        quests.update(state => ({ ...state, activeQuests: [] }));
        return [];
    }

    // get friends displayname
    const { data: profileResponse } = await supabase.from('user_profiles')
        .select('user_id, displayname')
        .in('user_id', questsData.map(quest =>
            quest.user1 === get(user)?.id ? quest.user2 : quest.user1
        ))
        .single();
    
    // Format quest data
    const activeQuests = questsData.map(item => {
        const friendId = item.user1 === currentUserId ? item.user2 : item.user1;
        const isUser1 = item.user1 === currentUserId;

        return {
            id: item.quest_id,
            title: item.social_quests.title,
            description: item.social_quests.description,
            reward: item.social_quests.prize || 100,
            status: item.status,
            participants: [get(user)?.id, friendId],
            friend_name: profileResponse?.displayname,
            initiated: isUser1,
            user1_completed: item.user1_completed || false,
            user2_completed: item.user2_completed || false,
            userCompleted: isUser1 ? item.user1_completed : item.user2_completed,
            friendCompleted: isUser1 ? item.user2_completed : item.user1_completed
        };
    });

    quests.update(state => ({ ...state, activeQuests, loading: false }));
    return activeQuests;
}

// Create a new quest with a friend
export async function createQuestWithFriend(friendId: string) {
    const currentUserId = get(user)?.id as string;

    const { error } = await supabase.rpc('create_friend_quest', { friend_id: friendId })

    if (error) return { error: error.message };

    await Promise.all([
        checkForQuestTicket(),
        loadActiveQuests()
    ]);
}

export async function getQuest(questId: number){

}

// Start a quest and show detailed view
export async function startQuest(questId: string) {
    const currentUserId = get(userProfile)?.user_id || get(user)?.id;

    if (!currentUserId) return { success: false, error: "Not authenticated" };

    try {
        // Get the quest details
        const { data: questData, error: questError } = await supabase
            .from('user_quests')
            .select(`*, social_quests(*)`)
            .eq('quest_id', questId)
            .single();

        if (questError) throw questError;
        if (!questData) return { success: false, error: "Quest not found" };

        // Update the quest to "in_progress" status
        const { error: updateError } = await supabase
            .from('user_quests')
            .update({ status: 'in_progress' })
            .eq('quest_id', questId);

        if (updateError) throw updateError;

        // Reload active quests to reflect the status change
        const quests = await loadActiveQuests();

        // Find and select the updated quest
        const updatedQuest = quests.find(q => q.id === questId);
        if (updatedQuest) {
            selectQuest(updatedQuest);
        }

        return {
            success: true,
            quest: updatedQuest
        };
    } catch (err) {
        return { success: false, error: handleError(err) };
    }
}

// Check if a user has completed their part of the quest
export async function checkQuestProgress(questId: string) {
    const currentUserId = get(userProfile)?.user_id || get(user)?.id;

    if (!currentUserId) return { success: false, error: "Not authenticated" };

    try {
        // Get quest details with description keywords
        const { data: questData, error: questError } = await supabase
            .from('user_quests')
            .select(`*, social_quests(*)`)
            .eq('quest_id', questId)
            .single();

        if (questError) throw questError;
        if (!questData) return { success: false, error: "Quest not found" };

        const questDescription = questData.social_quests?.description || '';
        const keywords = extractKeywords(questDescription);

        console.log("Quest keywords:", keywords);

        // Get user's recent events - fix the order field to created_at
        let { data: userEventsData, error: eventsError } = await supabase
            .from('user_events')
            .select('*')
            .eq('user_id', currentUserId)
            .limit(10);

        if (eventsError) {
            console.error("Error fetching events:", eventsError);
            // Try alternative approach without ordering
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('user_events')
                .select('*')
                .eq('user_id', currentUserId)
                .limit(10);

            if (fallbackError) throw fallbackError;
            userEventsData = fallbackData;
        }

        console.log("Raw events data:", userEventsData);

        // Process events correctly depending on how they're stored
        const userEvents = userEventsData?.map(eventRecord => {
            // Log each event structure to debug
            console.log("Processing event:", eventRecord);

            // Handle different event data structures
            if (typeof eventRecord === 'object') {
                if (eventRecord.title) {
                    return { title: eventRecord.title };
                }
                if (eventRecord.event) {
                    if (typeof eventRecord.event === 'object') {
                        return eventRecord.event;
                    } else if (typeof eventRecord.event === 'string') {
                        try {
                            return JSON.parse(eventRecord.event);
                        } catch (e) {
                            return { title: eventRecord.event };
                        }
                    }
                }
            }
            return null;
        }).filter(Boolean);

        console.log("Processed events:", userEvents);

        // Check if any event title contains keywords from the quest
        const isCompleted = userEvents?.some(event => {
            let eventTitle = '';

            // Extract title from various structures
            if (typeof event === 'string') {
                eventTitle = event;
            } else if (event.title) {
                eventTitle = event.title;
            } else if (event.description) {
                eventTitle = event.description;
            }

            // Check if any keyword matches
            const matched = keywords.some(keyword =>
                eventTitle.toLowerCase().includes(keyword.toLowerCase())
            );

            if (matched) {
                console.log(`Event "${eventTitle}" matched quest keywords`);
            }

            return matched;
        });

        // Inside the isCompleted block in checkQuestProgress function
        if (isCompleted) {
            console.log("User completed quest objective!");

            // Update the appropriate field based on which user completed it
            const isUser1 = questData.user1 === currentUserId;
            const updateField = isUser1 ? 'user1_completed' : 'user2_completed';

            console.log(`Setting ${updateField} to true for quest ${questId}`);

            // Get current status before update
            const { data: beforeUpdate } = await supabase
                .from('user_quests')
                .select('user1_completed, user2_completed')
                .eq('quest_id', questId)
                .single();

            console.log("Before DB update:", beforeUpdate);

            const { error: updateError } = await supabase
                .from('user_quests')
                .update({ [updateField]: true })
                .eq('quest_id', questId);

            if (updateError) throw updateError;

            // Verify update
            const { data: afterUpdate } = await supabase
                .from('user_quests')
                .select('user1_completed, user2_completed')
                .eq('quest_id', questId)
                .single();

            console.log("After DB update:", afterUpdate);

            // Immediate store update to reflect change in UI
            quests.update(state => {
                console.log("Current store state:", JSON.stringify(state, null, 2));

                // Update the selectedQuest if it's the current quest
                let updatedSelectedQuest = state.selectedQuest;
                if (state.selectedQuest && state.selectedQuest.id === questId) {
                    updatedSelectedQuest = {
                        ...state.selectedQuest,
                        user1_completed: isUser1 ? true : state.selectedQuest.user1_completed,
                        user2_completed: isUser1 ? state.selectedQuest.user2_completed : true,
                    };
                }

                // Update in the activeQuests array
                const updatedActiveQuests = state.activeQuests.map(quest => {
                    if (quest.id === questId) {
                        return {
                            ...quest,
                            user1_completed: isUser1 ? true : quest.user1_completed,
                            user2_completed: isUser1 ? quest.user2_completed : true,
                        };
                    }
                    return quest;
                });

                console.log("Updated selectedQuest:", updatedSelectedQuest);

                return {
                    ...state,
                    activeQuests: updatedActiveQuests,
                    selectedQuest: updatedSelectedQuest
                };
            });

            // Check if both users have completed the quest
            if (
                (questData.user1 === currentUserId && questData.user2_completed) ||
                (questData.user2 === currentUserId && questData.user1_completed)
            ) {
                // Both users have completed their objectives, mark quest as completed
                await completeQuest(questId);
            }

            // Reload quests to reflect changes
            await loadActiveQuests();
            return { success: true, completed: true };
        }

        return { success: true, completed: false };
    } catch (err) {
        console.error("Error checking quest progress:", err);
        return { success: false, error: handleError(err) };
    }
}

// Complete a quest and award rewards
async function completeQuest(questId: string) {
    try {
        // Update quest status to completed
        const { error: updateError } = await supabase
            .from('user_quests')
            .update({ status: 'completed' })
            .eq('quest_id', questId);

        if (updateError) throw updateError;

        // Get quest details to award rewards
        const { data: questData, error: questError } = await supabase
            .from('user_quests')
            .select(`*, social_quests(*)`)
            .eq('quest_id', questId)
            .single();

        if (questError || !questData) return;

        const reward = questData.social_quests?.prize || 100;

        // Award coins to both users
        await Promise.all([
            awardCoins(questData.user1, reward),
            awardCoins(questData.user2, reward)
        ]);

        // Create completion events
        await Promise.all([
            createCompletionEvent(questData.user1, questData.social_quests?.title),
            createCompletionEvent(questData.user2, questData.social_quests?.title)
        ]);

        return true;
    } catch (err) {
        console.error("Error completing quest:", err);
        return false;
    }
}

// Helper functions
function extractKeywords(text: string): string[] {
    if (!text) return [];

    // Remove common words and split into keywords
    const stopWords = ['the', 'and', 'a', 'an', 'in', 'on', 'at', 'to', 'for', 'with'];

    // More flexible tokenization - extract more meaningful words  
    const tokens = text
        .toLowerCase()
        .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '')  // Remove punctuation
        .split(/\s+/)
        .filter(word =>
            word.length > 2 && !stopWords.includes(word)
        );

    // Add common combinations for better matching chance
    const keywords = [...tokens];

    // Log keywords for debugging
    console.log("Extracted keywords:", keywords);

    return keywords;
}

async function awardCoins(userId: string, amount: number) {
    try {
        const { error } = await supabase.rpc('add_coins', {
            p_user_id: userId,
            p_coins: amount
        });

        if (error) throw error;
    } catch (err) {
        console.error("Error awarding coins:", err);
    }
}

async function createCompletionEvent(userId: string, questTitle: string) {
    try {
        await supabase
            .from('user_events')
            .insert({
                user_id: userId,
                title: `Completed quest: ${questTitle || 'Social Quest'}`,
                type: 'quest_completion',
                points: 25
            });
    } catch (err) {
        console.error("Error creating completion event:", err);
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