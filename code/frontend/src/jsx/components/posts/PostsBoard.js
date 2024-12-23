import { useState } from "react";
import CreatePostDialog from "../dialogs/CreatePostDialog";
import PostsBoardEntry from "./PostsBoardEntry";
import PostsBoardAssignment from "./PostsBoardAssignment";

const PostsBoard = (props) => {
    const [showNewPost, setShowNewPost] = useState(false);

    return <>
    <CreatePostDialog show={showNewPost}
        classId={props.classData.id}
        units={props.classData.units}
        onPostAdded={props.onPostAdded}
        onDismiss={() => { setShowNewPost(false); }}/>
    <div className="postsBoardContainer">
        {props.classData.should_show_edit_button && <div className="card postsBoardPublishButton" 
            onClick={()=>{ setShowNewPost(true); }}>➕ Nueva publicación</div>}
        {props.classData.posts.map(p => {
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