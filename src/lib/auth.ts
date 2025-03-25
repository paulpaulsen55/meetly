import { supabase } from '$lib/supabase'
import { goto } from '$app/navigation'
import { session, user, userProfile } from './stores'

// Initial session
supabase.auth.getSession().then(({ data }) => {
    console.log("Initial session:", data);
    
    session.set(data.session)
    user.set(data.session?.user || null)
})

// Listen for auth changes
supabase.auth.onAuthStateChange(async (event, newSession) => {
    console.log("Auth event:", event, newSession);
    
    session.set(newSession)
    user.set(newSession?.user || null)
    

    if (event == "SIGNED_OUT") {
        user.set(null)
        userProfile.set(null)
        goto('/')
    }
})