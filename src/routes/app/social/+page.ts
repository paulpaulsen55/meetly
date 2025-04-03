import { loadFriendsCount, loadUsersAndFriends } from "$lib/friends";
import { checkForQuestTicket, getAllQuests } from "$lib/quests";
import type { PageLoad } from "./$types";

export const load: PageLoad = async({depends}) =>{
    depends("app:friends", "app:quests");

    return {
        users: await loadUsersAndFriends(),
        friendsCount: await loadFriendsCount(),
        hasTicket: await checkForQuestTicket(),
        quests: await getAllQuests()
    }
}