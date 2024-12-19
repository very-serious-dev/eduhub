import { useContext, useState } from "react";
import SubmitAssignmentDialog from "../dialogs/SubmitAssignmentDialog";
import { FeedbackContext } from "../../main/GlobalContainer";

const AssignmentStudentLeftPaneContent = (props) => {
    const [showSubmit, setShowSubmit] = useState(false);
    const setFeedback = useContext(FeedbackContext);

    const onSubmitCreated = (errorMessage) => {
        if (errorMessage === undefined || errorMessage === "") {
            setFeedback({ type: "success", message: "Tarea entregada" });
            //props.onShouldRefresh();
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    return <><SubmitAssignmentDialog show={showSubmit}
        assignmentId={props.assignmentId}
        onDismiss={() => { setShowSubmit(false); }}
        onSubmitCreated={onSubmitCreated} />
        <div className="assignmentDetailLeftPaneTitle">
            💼 Tu trabajo
        </div>
        <div className="classDetailSectionUnderline" />
        {/* TODO: My previous submit */}
        {/* TODO: Disable button if it has already been submitted */}
        <div className="card submitAssignmentButton"
            onClick={() => { setShowSubmit(true); }}>➕ Subir entrega</div></>
}

export default AssignmentStudentLeftPaneContent;