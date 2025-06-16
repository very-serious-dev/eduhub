const POSTS_CACHE_PREFIX = "POSTS_FOR_CLASS_ID_"
const GROUP_UPDATE_CACHE_PREFIX = "LAST_KNOWN_UPDATE_FOR_GROUP_TAG_"
const SESSION_INFO = "SESSION_INFO"

const GetCachedPosts = (classId) => {
    const posts = localStorage.getItem(POSTS_CACHE_PREFIX + classId);
    if (posts) {
        try {
            const postsObject = JSON.parse(posts);
            postsObject.sort((a, b) => b.id - a.id);
            return postsObject;
        } catch (e) {
            localStorage.removeItem(POSTS_CACHE_PREFIX + classId);
        }
    }
    return []
}

const SetCachedPosts = (classId, posts) => {
    localStorage.setItem(POSTS_CACHE_PREFIX + classId, JSON.stringify(posts));
}

const GetLastKnownGroupAnnouncementTimestamp = (groupTag) => {
    const timestamp = localStorage.getItem(GROUP_UPDATE_CACHE_PREFIX + groupTag);
    return timestamp ?? 0;
}

const SetLastKnownGroupAnnouncementTimestamp = (groupTag, timestamp) => {
    localStorage.setItem(GROUP_UPDATE_CACHE_PREFIX + groupTag, timestamp);
}

const RemoveClientCache = () => {
    localStorage.clear();
}

const SetSessionInfo = (sessionInfo) => {
    localStorage.setItem(SESSION_INFO, JSON.stringify(sessionInfo));
}

const GetSessionUsername = () => {
    const sessionInfo = localStorage.getItem(SESSION_INFO);
    if (sessionInfo) {
        try {
            const sessionInfoObject = JSON.parse(sessionInfo);
            return sessionInfoObject.username;
        } catch (e) {
            localStorage.removeItem(SESSION_INFO);
        }
    }
    return "";
}

const GetSessionUserRoles = () => {
    const sessionInfo = localStorage.getItem(SESSION_INFO);
    if (sessionInfo) {
        try {
            const sessionInfoObject = JSON.parse(sessionInfo);
            return sessionInfoObject.roles;
        } catch (e) {
            localStorage.removeItem(SESSION_INFO);
        }
    }
    return [];
}

const GetSessionUserMaxStorage = () => {
    const sessionInfo = localStorage.getItem(SESSION_INFO);
    if (sessionInfo) {
        try {
            const sessionInfoObject = JSON.parse(sessionInfo);
            return sessionInfoObject.max_storage;
        } catch (e) {
            localStorage.removeItem(SESSION_INFO);
        }
    }
    return {documents: null, folders: null, bytes: null};
}

const IsLoggedIn = () => {
    return GetSessionUsername() !== ""
}



export { GetCachedPosts }
export { SetCachedPosts }
export { GetLastKnownGroupAnnouncementTimestamp }
export { SetLastKnownGroupAnnouncementTimestamp }
export { RemoveClientCache }
export { SetSessionInfo }
export { GetSessionUsername }
export { GetSessionUserRoles }
export { GetSessionUserMaxStorage }
export { IsLoggedIn }