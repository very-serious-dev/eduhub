import { useContext, useState } from "react";
import SubmitAssignmentDialog from "../dialogs/SubmitAssignmentDialog";
import { FeedbackContext } from "../../main/GlobalContainer";
import AssignmentUserStatus from "./AssignmentUserStatus";

const AssignmentStudentLeftPaneContent = (props) => {
    const [showSubmit, setShowSubmit] = useState(false);
    const setFeedback = useContext(FeedbackContext);

    const onSubmitCreated = (errorMessage) => {
        if (errorMessage === undefined || errorMessage === "") {
            setFeedback({ type: "success", message: "Tarea entregada" });
            props.onShouldRefresh();
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    return <>
        <SubmitAssignmentDialog show={showSubmit}
            assignmentId={props.assignmentData.id}
            onDismiss={() => { setShowSubmit(false); }}
            onSubmitCreated={onSubmitCreated} />
        <div className="assignmentDetailLeftPaneTitle">
            💼 Tu trabajo
        </div>
        <div className="classDetailSectionUnderline" />
        {props.assignmentData.your_submit !== undefined ?
            <>
                <AssignmentUserStatus submit={props.assignmentData.your_submit} author={props.assignmentData.your_submit.author}/>
                <p>🎉 ¡Ya has entregado la tarea!</p>
            </> :
            <>
                <p>No has entregado la tarea todavía</p>
                <div className="card submitAssignmentButton"
                    onClick={() => { setShowSubmit(true); }}>➕ Subir entrega</div>
            </>}
    </>
}

export default AssignmentStudentLeftPaneContent;