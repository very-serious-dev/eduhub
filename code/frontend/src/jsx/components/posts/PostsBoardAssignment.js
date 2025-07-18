import { useNavigate } from "react-router";
import { beautifullyDisplayDateTime, footNoteDateAuthor } from "../../../util/Formatter";
import { ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID, ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID } from "../../pages/AssignmentPage";
import PostsBoardEntryTopRightContent from "./PostsBoardEntryTopRightContent";
import { pointableSecondary, tertiary } from "../../../util/Themes";
import { useContext } from "react";
import { ThemeContext } from "../../main/GlobalContainer";

const PostsBoardAssignment = (props) => {
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);

    const onClick = () => {
        sessionStorage.setItem(ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID(props.post.id), props.post.title);
        sessionStorage.setItem(ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID(props.post.id), props.post.content);
        navigate(`/assignments/${props.post.id}`)
    }

    const isQuestionnaireAttached = () => {
        return props.post.attachments.some(a => a.type === 'questionnaire');
    }

    return <div className={`card classDetailEntry pointable ${tertiary(theme)} ${pointableSecondary(theme)}`} onClick={onClick}>
        <PostsBoardEntryTopRightContent post={props.post}
            classUnits={props.classUnits}
            classroomId={props.classroomId}
            showEdit={props.showEdit}
            onPostsChanged={props.onPostsChanged} />
        <div className="classDetailAssignmentTitle">{isQuestionnaireAttached() ? "📝" : "💼"} {props.post.title}</div>
        <div className="classDetailAssignmentDueDate">Se entrega: {beautifullyDisplayDateTime(props.post.assignment_due_date)}</div>
        <div className="dateAuthorFootNote">
            {footNoteDateAuthor(props.post.publication_date, props.post.author, props.post.modificationDate)}
        </div>
    </div>
}

export default PostsBoardAssignment;