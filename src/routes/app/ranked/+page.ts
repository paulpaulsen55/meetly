import { supabase } from '$lib/supabase';
import type { PageLoad } from "./$types";

export const load: PageLoad = async ({ depends }) => {
    depends("app:ranked");
    
    const { data, error } = await supabase.rpc('get_user_displaynames_and_coins');
    
    return { 
        users: data || [],
        error: error ? error.message : '' 
    };
};