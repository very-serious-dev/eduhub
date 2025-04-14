const POSTS_CACHE_PREFIX = "POSTS_FOR_CLASS_ID_"
const GROUP_UPDATE_CACHE_PREFIX = "LAST_KNOWN_UPDATE_FOR_GROUP_TAG_"

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

export { GetCachedPosts }
export { SetCachedPosts }
export { GetLastKnownGroupAnnouncementTimestamp }
export { SetLastKnownGroupAnnouncementTimestamp }
export { RemoveClientCache }