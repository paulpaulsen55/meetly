import type { Session, User } from "@supabase/supabase-js";
import { writable } from "svelte/store";

export interface EventData {
    date: string;
    title: string;
}

export type UserProfile = {
    events: EventData[]
    displayname: string
    settings: any
    coins: number
    user_id: string
}

export type Action = {
    id: number
    name: string
    description?: string
    coins: string
    icon?: string
}

export type Friends = {
    users: UserProfile[]
    friendIds: Set<string>
    friendCount: number
    loading: boolean
    error: string | null
    pendingRequests: Set<string>
}

export type Quest = {
    id: string;
    title: string;
    description: string;
    reward: number;
    status: 'active' | 'in_progress' | 'completed';
    participants: string[];
    friend_name?: string;
    user1_completed?: boolean;
    user2_completed?: boolean;
    initiated?: boolean;
  };

export type Quests = {
    activeQuests: Quest[]
    hasTicket: boolean
    selectedQuest: Quest | null
    error: string | null
    friendsQuests?: Record<string, Quest[]> 
}

export const user = writable<User | null>(null)
export const session = writable<Session | null>(null)
export const userProfile = writable<UserProfile | null>(null)
export const actions = writable<Action[]>([])
export const friends = writable<Friends>({
    users: [],
    friendIds: new Set<string>(),
    friendCount: 0,
    loading: false,
    error: null,
    pendingRequests: new Set<string>()
})
export const quests = writable<Quests>({
    activeQuests: [],
    hasTicket: false,
    selectedQuest: null,
    error: null,
    friendsQuests: {}
});