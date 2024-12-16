import { useNavigate } from "react-router-dom"
import { beautifullyParseDate } from "../../../util/Formatter";

const ClassDetailAssignmentItem = (props) => {
    const navigate = useNavigate();

    return <div key={props.assignment.id}
                className="classDetailSectionSubitem sectionSubitemPaddingTopBottomSmall"
                onClick={() => {navigate(`/assignments/${props.assignment.id}`)}}>
                    <div className="classDetailSectionAssignmentDueDateCapsule">
                        { props.assignment.taskDueDate !== undefined
                         ? beautifullyParseDate(new Date(props.assignment.taskDueDate))
                         : "Sin fecha definida" }
                    </div>
                    <div>💼 {props.assignment.title}</div>
            </div>
}

export default ClassDetailAssignmentItem;