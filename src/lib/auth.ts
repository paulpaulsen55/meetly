import { writable } from 'svelte/store'
import { supabase } from '$lib/supabase'
import type { Session, User } from '@supabase/supabase-js'

export const user = writable<User | null>(null)
export const session = writable<Session | null>(null)

// Initial session
supabase.auth.getSession().then(({ data }) => {
    session.set(data.session)
    user.set(data.session?.user || null)
})

// Listen for auth changes
supabase.auth.onAuthStateChange((event, newSession) => {
    session.set(newSession)
    user.set(newSession?.user || null)
})