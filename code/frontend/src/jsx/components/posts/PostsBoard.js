import { useState } from "react";
import CreatePostDialog from "../dialogs/CreatePostDialog";
import PostsBoardEntry from "./PostsBoardEntry";
import PostsBoardAssignment from "./PostsBoardAssignment";

const PostsBoard = (props) => {
    const [showNewPost, setShowNewPost] = useState(false);

    const shouldFilterPosts = () => {
        if (props.searchedText === undefined || props.searchedText === "") { return false; }
        return true;
    }

    let searchRegexp = undefined;
    if (shouldFilterPosts()) {
        // https://stackoverflow.com/a/38151393 (replace possible regex special chars from user input); 'i' for case-insensitive
        searchRegexp = new RegExp(props.searchedText.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&"), "i");
    }

    const squashedPosts = () => {
        // Posts of a classroom are not directly modified/erased with PUT or DELETE operations
        // Instead, a new Post (via POST) of kind amend_edit or amend_delete is created, so that
        // 1) History of all changes is preserved
        // 2) We can take better advantage of client caching
        // With this method, some posts like:
        //
        // id=1; kind="publication"; title="Hello world"              <--- actually more attributes exist
        // id=2; kind="publication"; title="Hows it going?"
        // id=3; kind="amend_edit"; title="How's it going?"; amends=2
        // id=4; kind="publication"; title="Who cares!!"
        // id=5; kind="amend_delete"; amends=4
        //
        // ...are squashed into what the history should look like:
        //
        // id=1; kind="publication"; title="Hello world"  
        // id=2; kind="publication"; title="How's it going?"
        const sortedPosts = [...props.classData.posts]
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

    return <>
        <CreatePostDialog show={showNewPost}
            classId={props.classData.id}
            units={props.classData.units}
            onFinished={props.onPostsChanged}
            onDismiss={() => { setShowNewPost(false); }} />
        <div className="postsBoardContainer">
            {props.classData.should_show_edit_button && <div className="card postsBoardPublishButton"
                onClick={() => { setShowNewPost(true); }}>➕ Nueva publicación</div>}
            {squashedPosts()
                .map(p => {
                    if (p.unit_id) {
                        const unitName = props.classData.units.find(u => u.id === p.unit_id).name
                        if (unitName) {
                            return { ...p, unitName: unitName }
                        } // unit might have been deleted
                    }
                    return p;
                })
                .filter(p => {
                    if (shouldFilterPosts()) {
                        if (searchRegexp.test(p.title) || searchRegexp.test(p.content)) {
                            return true;
                        }
                        if (p.unitName && searchRegexp.test(p.unitName)) {
                            return true;
                        }
                        if (p.files) {
                            for (let f of p.files) {
                                if (searchRegexp.test(f.name)) {
                                    return true;
                                }
                            }
                        }
                        return false;
                    }
                    return true;
                })
                .map(p => {
                    if (p.kind === "publication") {
                        return <PostsBoardEntry post={p}
                            classUnits={props.classData.units}
                            showEdit={props.classData.should_show_edit_button}
                            onPostsChanged={props.onPostsChanged} />
                    } else if (p.kind === "assignment") {
                        return <PostsBoardAssignment post={p}
                            classUnits={props.classData.units}
                            showEdit={props.classData.should_show_edit_button}
                            onPostsChanged={props.onPostsChanged} />
                    }
                })}
        </div>
    </>
}

export default PostsBoard;