import { get, writable } from 'svelte/store'
import { supabase } from '$lib/supabase'
import type { Session, User } from '@supabase/supabase-js'
import { goto } from '$app/navigation'

export type UserProfile = {
    streak: number
    displayname: string
    settings: any
}

export const user = writable<User | null>(null)
export const userProfile = writable<UserProfile | null>(null)
export const session = writable<Session | null>(null)

// Initial session
supabase.auth.getSession().then(({ data }) => {
    session.set(data.session)
    user.set(data.session?.user || null)
})

// Listen for auth changes
supabase.auth.onAuthStateChange(async (event, newSession) => {
    session.set(newSession)
    user.set(newSession?.user || null)

    if (event == "SIGNED_OUT") {
        user.set(null)
        userProfile.set(null)
        goto('/')
    }
})