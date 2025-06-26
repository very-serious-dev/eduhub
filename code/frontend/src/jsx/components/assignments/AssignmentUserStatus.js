import { useContext, useState } from "react";
import AssignmentSubmitDialog from "../dialogs/AssignmentSubmitDialog";
import { accentForeground, pointableSecondary, tertiary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const AssignmentUserStatus = (props) => {
    const [showSubmitDialog, setShowSubmitDialog] = useState(false);
    const theme = useContext(ThemeContext);

    return <>
        {showSubmitDialog && <AssignmentSubmitDialog author={props.author}
            submit={props.submit}
            assignmentId={props.assignmentId}
            canEditScore={props.canEditScore}
            onScoreChanged={props.onScoreChanged}
            onDismiss={() => { setShowSubmitDialog(false); }} />}
        <div className={`assignmentCell pointable ${pointableSecondary(theme)}`} onClick={() => { setShowSubmitDialog(true); }}>
            <div className="assignmentCellHeader">
                <div className="assignmentCellHeaderSurnameAndName">{`${props.author.surname}, ${props.author.name}`}</div>
                {(props.submit && props.submit.score) &&
                  <div className="assignmentCellHeaderScoreContainer">
                    {props.submit.is_score_published === false && <div className="assignmentCellHeaderScoreUnpublishedHint">Sin<br/>publicar</div>}
                    <div className={`assignmentCellHeaderScore ${props.submit.is_score_published === false ? "scoreUnpublished" : accentForeground(theme)}`}>{props.submit.score}</div>
                </div>}
            </div>
            <div className="assignmentCellUsername">{props.author.username}</div>
            {props.submit !== undefined ?
                <div className={`assignmentCellStatus assignmentOk ${tertiary(theme)}`}>Entregado</div> :
                <div className="assignmentCellStatus assignmentKo">Sin entregar</div>}
        </div>
    </>
}

export default AssignmentUserStatus;