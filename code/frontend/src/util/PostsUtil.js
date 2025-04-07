const squashedPosts = (posts) => {
    // Posts of a classroom are not directly modified/erased with PUT or DELETE operations
    // Instead, a new Post (via POST) of kind amend_edit or amend_delete is created, so that
    // 1) History of all changes is preserved beyond HTTP logs
    // 2) We can take better advantage of client caching
    // With this method, some posts like:
    //
    // id=1; kind="publication"; title="Hello world"           <--- actually more attributes exist
    // id=2; kind="publication"; title="Hows it going?"
    // id=3; kind="amend_edit"; title="How's it going?"; amends=2
    // id=4; kind="publication"; title="Who cares!!"
    // id=5; kind="amend_delete"; amends=4
    //
    // ...are squashed into:
    //
    // id=1; kind="publication"; title="Hello world"  
    // id=2; kind="publication"; title="How's it going?"
    const sortedPosts = [...posts]
    sortedPosts.sort((a, b) => a.id - b.id); // sort by id, ascending (oldest first)
    const postsDictionary = {}
    sortedPosts.filter(p => p.kind === "publication" || p.kind === "assignment").forEach(p => {
        postsDictionary[p.id] = p
    });
    sortedPosts.filter(p => p.kind === "amend_edit").forEach(p => {
        const editedPost = {...p}
        editedPost["id"] = p.amended_post_id;
        editedPost["publication_date"] = postsDictionary[p.amended_post_id].publication_date;
        editedPost["kind"] = postsDictionary[p.amended_post_id].kind;
        editedPost["modificationDate"] = p.publication_date
        postsDictionary[p.amended_post_id] = editedPost;
    });
    sortedPosts.filter(p => p.kind === "amend_delete").forEach(p => {
        const deleted_post_id = p.amended_post_id
        delete postsDictionary[deleted_post_id];
    })
    const squashedPosts = Object.keys(postsDictionary).map(k => postsDictionary[k]);
    squashedPosts.sort((a, b) => b.id - a.id); // sort by id, descending (newest first)
    return squashedPosts
}

export { squashedPosts };

