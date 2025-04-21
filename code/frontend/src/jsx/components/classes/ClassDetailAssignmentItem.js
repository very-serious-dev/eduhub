import { useNavigate } from "react-router-dom"
import { formatNullableDueDate } from "../../../util/Formatter";
import { ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID, ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID } from "../../pages/AssignmentPage";
import { pointableSecondary, tertiary } from "../../../util/Themes";
import { useContext } from "react";
import { ThemeContext } from "../../main/GlobalContainer";

const ClassDetailAssignmentItem = (props) => {
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);

    const onClick = () => {
        sessionStorage.setItem(ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID(props.assignment.id), props.assignment.title);
        sessionStorage.setItem(ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID(props.assignment.id), props.assignment.content);
        navigate(`/assignments/${props.assignment.id}`)
    }

    return <div key={props.assignment.id}
                className={`classDetailSectionSubitem sectionSubitemPaddingTopBottomSmall pointable ${pointableSecondary(theme)}`}
                onClick={onClick}>
                    <div className={`classDetailSectionAssignmentDueDateCapsule ${tertiary(theme)}`}>
                        { formatNullableDueDate(props.assignment.assignment_due_date) }
                    </div>
                    <div>💼 {props.assignment.title}</div>
            </div>
}

export default ClassDetailAssignmentItem;