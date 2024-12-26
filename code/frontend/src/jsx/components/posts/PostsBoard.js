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

    return <>
        <CreatePostDialog show={showNewPost}
            classId={props.classData.id}
            units={props.classData.units}
            onPostAdded={props.onPostAdded}
            onDismiss={() => { setShowNewPost(false); }} />
        <div className="postsBoardContainer">
            {props.classData.should_show_edit_button && <div className="card postsBoardPublishButton"
                onClick={() => { setShowNewPost(true); }}>➕ Nueva publicación</div>}
            {props.classData.posts
                .filter(p => {
                    if (shouldFilterPosts()) {
                        if (searchRegexp.test(p.title) || searchRegexp.test(p.content)) {
                            return true;
                        }
                        if (p.unit_name !== null && p.unit_name !== undefined && searchRegexp.test(p.unit_name)) {
                            return true;
                        }
                        if (p.files !== null && p.files !== undefined) {
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
                        return <PostsBoardEntry post={p} />
                    } else if (p.kind === "assignment") {
                        return <PostsBoardAssignment post={p} />
                    }
                })}
        </div>
    </>
}

export default PostsBoard;