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
        // Get user's active quests - include more fields for completion status
        const { data: questsData, error: questsError } = await supabase
            .from('user_quests')
            .select(`quest_id, user1, user2, status, user1_completed, user2_completed`)
            .or(`user1.eq.${currentUserId},user2.eq.${currentUserId}`);
        
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
            const isUser1 = item.user1 === currentUserId;
            
            return {
                id: item.quest_id,
                title: questTemplate.title,
                description: questTemplate.description,
                reward: questTemplate.prize || 100,
                status: item.status,
                participants: [currentUserId, friendId],
                friend_name: friendMap[friendId] || 'friend',
                initiated: isUser1,
                user1_completed: item.user1_completed || false,
                user2_completed: item.user2_completed || false,
                userCompleted: isUser1 ? item.user1_completed : item.user2_completed,
                friendCompleted: isUser1 ? item.user2_completed : item.user1_completed
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