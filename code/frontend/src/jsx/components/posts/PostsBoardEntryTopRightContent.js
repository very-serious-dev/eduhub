import { useContext, useState } from "react";
import EditPostDialog from "../dialogs/EditPostDialog";
import { ThemeContext } from "../../main/GlobalContainer";
import { pointablePrimary, secondary } from "../../../util/Themes";

const PostsBoardEntryTopRightContent = (props) => {
    const [showEditPopup, setShowEditPopup] = useState(false);
    const theme = useContext(ThemeContext);

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
            {props.post.unitName && <div className={`classDetailEntryTopRightUnit ${secondary(theme)}`}>{props.post.unitName}</div>}
            {props.showEdit && <div className={`classDetailEntryTopRightEdit pointable ${pointablePrimary(theme)}`} onClick={onEdit}>⚙️</div>}
        </div>
    </>
}

export default PostsBoardEntryTopRightContent;