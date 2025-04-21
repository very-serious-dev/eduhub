import { useNavigate } from "react-router-dom";
import { formatNullableDueDate, formatPseudoMarkdown } from "../../../util/Formatter";
import AssignmentStudentLeftPaneContent from "./AssignmentStudentLeftPaneContent";
import SmallFilesListFile from "../common/SmallFilesListFile";
import AssignmentTeacherLeftPaneContent from "./AssignmentTeacherLeftPaneContent";
import LoadingHUD from "../common/LoadingHUD";
import { useContext, useState } from "react";
import EditPostDialog from "../dialogs/EditPostDialog";
import { accent, pointableSecondary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const AssignmentBody = (props) => {
    const [showEditAssignmentPopup, setShowEditAssignmentPopup] = useState(false);
    const navigate = useNavigate();
    const theme = useContext(ThemeContext);

    const appropriateLeftPaneContent = () => {
        if (props.isLoading) {
            return <LoadingHUD />
        } else if (props.assignmentData.should_show_teacher_options === true) {
            return <AssignmentTeacherLeftPaneContent
                assignmentData={props.assignmentData}
                onScoreChanged={props.onScoreChanged}
                onShouldRefresh={props.onShouldRefresh} />
        } else {
            return <AssignmentStudentLeftPaneContent
                assignmentData={props.assignmentData}
                onShouldRefresh={props.onShouldRefresh} />
        }
    }

    return <>
        <EditPostDialog show={showEditAssignmentPopup}
            post={props.assignmentData}
            units={props.assignmentData.class_units}
            onFinished={props.onShouldRefresh}
            onDismiss={() => { setShowEditAssignmentPopup(false); }} />
        <div>
            <div className="classDetailHeaderTopIcons">
                {props.assignmentData.should_show_teacher_options === true &&
                    <div className={`classDetailHeaderIcon pointable ${pointableSecondary(theme)}`} onClick={() => { setShowEditAssignmentPopup(true); }}>⚙️</div>}
                <div className={`classDetailHeaderIcon pointable ${pointableSecondary(theme)}`} onClick={() => { navigate(-1); }}>✖️</div>
            </div>
            <div className="assignmentDetailTitleHeader">
                <div className="assignmentDetailTitle">{props.assignmentData.title}</div>
                <div className="assignmentDetailDueDate">Se entrega: {formatNullableDueDate(props.assignmentData.assignment_due_date)}</div>
                <div className={`classDetailSectionUnderline ${accent(theme)}`} />
            </div>
            <div className="assignmentDetailBodyContainer">
                <div className="assignmentDetailBodyColumn1">
                    <div className="card assignmentDetailLeftPane">
                        {appropriateLeftPaneContent()}
                    </div>
                </div>
                <div className="assignmentDetailBodyColumn2">
                    <div className="assignmentDetailContent">{formatPseudoMarkdown(props.assignmentData.content)}</div>
                    {props.isLoading ? <LoadingHUD /> :
                        <>
                            <div className="assignmentDetailBodyFilesTitle">📎 Documentos adjuntos</div>
                            <div className="assignmentDetailBodyFiles">
                                {props.assignmentData.files !== undefined && (
                                    props.assignmentData.files.length > 0 ?
                                        props.assignmentData.files.map(f => <SmallFilesListFile file={f} />)
                                        : <p>No hay ficheros adjuntos</p>
                                )}
                            </div>
                        </>}
                </div>
            </div>
        </div></>
}

export default AssignmentBody;