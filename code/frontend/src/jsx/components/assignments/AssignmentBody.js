import { useNavigate } from "react-router-dom";
import { formatNullableDueDate } from "../../../util/Formatter";
import AssignmentStudentLeftPaneContent from "./AssignmentStudentLeftPaneContent";
import PostsBoardEntryFile from "../posts/PostsBoardEntryFile";
import AssignmentTeacherLeftPaneContent from "./AssignmentTeacherLeftPaneContent";
import LoadingHUD from "../common/LoadingHUD";

const AssignmentBody = (props) => {
    const navigate = useNavigate();

    const appropriateLeftPaneContent = () => {
        if (props.isLoading) {
            return <LoadingHUD />
        } else if (props.assignmentData.should_show_teacher_options === true) {
            return <AssignmentTeacherLeftPaneContent
                assignmentData={props.assignmentData} />
        } else {
            return <AssignmentStudentLeftPaneContent
                assignmentData={props.assignmentData}
                onShouldRefresh={props.onShouldRefresh} />
        }
    }

    return <div>
        <div className="classDetailHeaderTopIcons">
            {/* TODO: EDIT ASSIGNMENT 
                props.classData.should_show_edit_button === true &&
                    <div className="classDetailHeaderIcon" onClick={() => { setShowEditClassPopup(true); }}>⚙️</div>*/}
            <div className="classDetailHeaderIcon" onClick={() => { navigate(-1); }}>✖️</div>
        </div>
        <div className="assignmentDetailTitleHeader">
            <div className="assignmentDetailTitle">{props.assignmentData.title}</div>
            <div className="assignmentDetailDueDate">Se entrega: {formatNullableDueDate(props.assignmentData.assignment_due_date)}</div>
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
                {props.isLoading ? <LoadingHUD /> :
                    <>
                        <div className="assignmentDetailBodyFilesTitle">📎 Documentos adjuntos</div>
                        <div className="assignmentDetailBodyFiles">
                            {props.assignmentData.files !== undefined && (
                                props.assignmentData.files.length > 0 ?
                                    props.assignmentData.files.map(f => <PostsBoardEntryFile file={f} />)
                                    : <p>No hay ficheros adjuntos</p>
                            )}
                        </div>
                    </>}
            </div>
        </div>
    </div>
}

export default AssignmentBody;