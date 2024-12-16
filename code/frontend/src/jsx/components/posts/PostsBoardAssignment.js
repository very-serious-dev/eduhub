import { useNavigate } from "react-router-dom";
import { beautifullyParseDate, footNoteForDateAndAuthor } from "../../../util/Formatter";

const PostsBoardAssignment = (props) => {
    const navigate = useNavigate();

    const dueDate = () => {
        if (props.post.taskDueDate === undefined) {
            return "Sin definir";
        }
        return beautifullyParseDate(new Date(props.post.taskDueDate));
    }

    return <div className="card classDetailEntry classDetailEntryAssignment" onClick={() => { navigate(`/assignments/${props.post.id}`) }}>
        {props.post.unitName && <div className="classDetailEntryUnit">{props.post.unitName}</div>}
        <div className="classDetailAssignmentTitle">💼 {props.post.title}</div>
        <div className="classDetailAssignmentDueDate">Fecha de entrega: { dueDate() }</div>
        <div className="classDetailEntryFootNote">
            {footNoteForDateAndAuthor(props.post.publication_date, props.post.author)}
        </div>
    </div>
}

export default PostsBoardAssignment;