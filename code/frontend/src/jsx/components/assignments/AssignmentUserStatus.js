import { useState } from "react";
import AssignmentSubmitDialog from "../dialogs/AssignmentSubmitDialog";

const AssignmentUserStatus = (props) => {
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);

    return <>
        <AssignmentSubmitDialog show={showSubmitDialog}
            author={props.author}
            submit={props.submit}
            assignmentId={props.assignmentId}
            canEditScore={props.canEditScore}
            onScoreChanged={props.onScoreChanged}
            onDismiss={() => { setShowSubmitDialog(false); }} />
        <div className="assignmentCell" onClick={() => { setShowSubmitDialog(true); }}>
            <div className="assignmentCellHeader">
                <div className="assignmentCellHeaderSurnameAndName">{`${props.author.surname}, ${props.author.name}`}</div>
                {((props.submit !== undefined) &&
                 (props.submit.score !== null) /* This happens when a student visits his assignment and there's an unpublished score */) &&
                  <div className="assignmentCellHeaderScoreContainer">
                    {props.submit.is_score_published === false && <div className="assignmentCellHeaderScoreUnpublishedHint">Sin<br/>publicar</div>}
                    <div className={`assignmentCellHeaderScore ${props.submit.is_score_published === false ? "scoreUnpublished" : "scorePublished"}`}>{props.submit.score}</div>
                </div>}
            </div>
            <div className="assignmentCellUsername">{props.author.username}</div>
            {props.submit !== undefined ?
                <div className="assignmentCellStatus assignmentOk">Entregado</div> :
                <div className="assignmentCellStatus assignmentKo">Sin entregar</div>}
        </div>
    </>
}

export default AssignmentUserStatus;