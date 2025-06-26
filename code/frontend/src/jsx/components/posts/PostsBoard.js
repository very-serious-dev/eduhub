import { useContext, useState } from "react";
import CreatePostDialog from "../dialogs/CreatePostDialog";
import PostsBoardEntry from "./PostsBoardEntry";
import PostsBoardAssignment from "./PostsBoardAssignment";
import { squashedPosts } from "../../../util/PostsUtil";
import { pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const PostsBoard = (props) => {
    const [showCreatePost, setShowCreatePost] = useState(false);
    const theme = useContext(ThemeContext);

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
        {showCreatePost && <CreatePostDialog classId={props.classData.id}
            units={props.classData.units}
            onFinished={props.onPostsChanged}
            onDismiss={() => { setShowCreatePost(false); }} />}
        <div className="postsBoardContainer">
            {props.classData.should_show_teacher_options && <div className={`card postsBoardPublishButton pointable ${primary(theme)} ${pointableSecondary(theme)}`}
                onClick={() => { setShowCreatePost(true); }}>➕ Nueva publicación</div>}
            {squashedPosts(props.classData.posts)
                .map(p => {
                    if (p.unit_id) {
                        const matchingUnit = props.classData.units.find(u => u.id === p.unit_id)
                        if (matchingUnit) {
                            return { ...p, unitName: matchingUnit.name }
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
                            showEdit={props.classData.should_show_teacher_options}
                            onPostsChanged={props.onPostsChanged} />
                    } else if (p.kind === "assignment") {
                        return <PostsBoardAssignment post={p}
                            classUnits={props.classData.units}
                            showEdit={props.classData.should_show_teacher_options}
                            onPostsChanged={props.onPostsChanged} />
                    }
                })}
        </div>
    </>
}

export default PostsBoard;