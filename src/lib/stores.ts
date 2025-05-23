import type { Session, User } from "@supabase/supabase-js";
import { writable } from "svelte/store";

export interface EventData {
    date: string;
    title: string;
    is_complete?: boolean;
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
export const n8nServer = writable<string>("http://localhost:5678/webhook/981ad22c-97a6-4f32-a0d9-c8e70cebcdb4")