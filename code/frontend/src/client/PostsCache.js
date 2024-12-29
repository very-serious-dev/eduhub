const PREFIX = "POSTS_FOR_CLASS_ID_"

const GetCachedPosts = (classId) => {
    const posts = localStorage.getItem(PREFIX + classId);
    if (posts) {
        try {
            const postsObject = JSON.parse(posts);
            postsObject.sort((a, b) => b.id - a.id);
            return postsObject;
        } catch (e) {
            localStorage.removeItem(PREFIX + classId);
        }
    }
    return []
}

const SetCachedPosts = (classId, posts) => {
    localStorage.setItem(PREFIX + classId, JSON.stringify(posts));
}

export { GetCachedPosts }
export { SetCachedPosts }