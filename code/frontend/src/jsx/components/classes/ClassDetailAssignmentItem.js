import { useNavigate } from "react-router-dom"
import { beautifullyDisplayDate } from "../../../util/Formatter";
import { ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID, ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID } from "../../pages/AssignmentPage";

const ClassDetailAssignmentItem = (props) => {
    const navigate = useNavigate();

    const onClick = () => {
        sessionStorage.setItem(ASSIGNMENT_TITLE_NAVIGATED_FROM_WITH_ID(props.assignment.id), props.assignment.title);
        sessionStorage.setItem(ASSIGNMENT_CONTENT_NAVIGATED_FROM_WITH_ID(props.assignment.id), props.assignment.content);
        navigate(`/assignments/${props.assignment.id}`)
    }

    return <div key={props.assignment.id}
                className="classDetailSectionSubitem sectionSubitemPaddingTopBottomSmall"
                onClick={onClick}>
                    <div className="classDetailSectionAssignmentDueDateCapsule">
                        { props.assignment.taskDueDate !== undefined
                         ? beautifullyDisplayDate(new Date(props.assignment.taskDueDate))
                         : "Sin fecha definida" }
                    </div>
                    <div>💼 {props.assignment.title}</div>
            </div>
}

export default ClassDetailAssignmentItem;