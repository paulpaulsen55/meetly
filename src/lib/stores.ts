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
}

export type Action = {
    id: number
    name: string
    description?: string
    coins: string
    icon?: string
}

export const user = writable<User | null>(null)
export const session = writable<Session | null>(null)
export const userProfile = writable<UserProfile | null>(null)
export const actions = writable<Action[]>([])