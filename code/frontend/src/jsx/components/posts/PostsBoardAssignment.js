import { useNavigate } from "react-router-dom";
import { footNoteDateAuthor, formatNullableDueDate } from "../../../util/Formatter";
import { ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID, ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID } from "../../pages/AssignmentPage";
import PostsBoardEntryTopRightContent from "./PostsBoardEntryTopRightContent";

const PostsBoardAssignment = (props) => {
    const navigate = useNavigate();

    const onClick = () => {
        sessionStorage.setItem(ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID(props.post.id), props.post.title);
        sessionStorage.setItem(ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID(props.post.id), props.post.content);
        navigate(`/assignments/${props.post.id}`)
    }

    return <div className="card classDetailEntry classDetailEntryAssignment" onClick={onClick}>
        <PostsBoardEntryTopRightContent post={props.post}
            classUnits={props.classUnits}
            showEdit={props.showEdit}
            onPostsChanged={props.onPostsChanged} />
        <div className="classDetailAssignmentTitle">💼 {props.post.title}</div>
        <div className="classDetailAssignmentDueDate">Se entrega: {formatNullableDueDate(props.post.assignment_due_date)}</div>
        <div className="classDetailEntryFootNote">
            {footNoteDateAuthor(props.post.author, props.post.publication_date, props.post.modificationDate)}
        </div>
    </div>
}

export default PostsBoardAssignment;