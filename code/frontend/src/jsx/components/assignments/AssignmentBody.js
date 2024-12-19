import { useNavigate } from "react-router-dom";
import { formatNullableDueDate } from "../../../util/Formatter";
import AssignmentStudentLeftPaneContent from "./AssignmentStudentLeftPaneContent";
import PostsBoardEntryFile from "../posts/PostsBoardEntryFile";

const AssignmentBody = (props) => {
    const navigate = useNavigate();

    const appropriateLeftPaneContent = () => {
        // Reminder: shouldShowTeacherOptions can be undefined while using preloaded data (sessionStorage)
        if (props.assignmentData.shouldShowTeacherOptions === true) {
            // WIP
        } else {

        }
        return <AssignmentStudentLeftPaneContent />
        // WIP temporarily show student pane
    }

    return <div>
        <div className="classDetailHeaderCloseIcon" onClick={() => { navigate(-1); }}>✖</div>
        <div className="assignmentDetailTitleHeader">
            <div className="assignmentDetailTitle">{props.assignmentData.title}</div>
            <div className="assignmentDetailDueDate">Fecha de entrega: {formatNullableDueDate(props.assignmentData.taskDueDate)}</div>
            <div className="classDetailSectionUnderline" />
        </div>
        <div className="assignmentDetailBodyContainer">
            <div className="assignmentDetailBodyColumn1">
                <div className="card assignmentDetailLeftPane">
                    {appropriateLeftPaneContent()}
                </div>
            </div>
            <div className="assignmentDetailBodyColumn2">
                <div className="assignmentDetailContent">{props.assignmentData.content}</div>
                <div className="assignmentDetailBodyFilesTitle">📎 Documentos adjuntos</div>
                <div className="assignmentDetailBodyFiles">
                    {props.assignmentData.files !== undefined && props.assignmentData.files.map(f => <PostsBoardEntryFile file={f} />)}
                </div>
            </div>
        </div>
    </div>
}

export default AssignmentBody;