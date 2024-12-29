import { useState } from "react";
import EditPostDialog from "../dialogs/EditPostDialog";

const PostsBoardEntryTopRightContent = (props) => {
    const [showEditPopup, setShowEditPopup] = useState(false);

    const onEdit = (event) => {
        event.stopPropagation();
        setShowEditPopup(true);
    }

    return <>
        <EditPostDialog show={showEditPopup}
            post={props.post}
            units={props.classUnits}
            onFinished={props.onPostsChanged}
            onDismiss={() => { setShowEditPopup(false); }} />
        <div className="classDetailEntryTopRightContainer">
            {props.post.unitName && <div className="classDetailEntryTopRightUnit">{props.post.unitName}</div>}
            {props.showEdit && <div className="classDetailEntryTopRightEdit" onClick={onEdit}>⚙️</div>}
        </div>
    </>
}

export default PostsBoardEntryTopRightContent;