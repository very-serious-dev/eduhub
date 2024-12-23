import { useState } from "react";
import AssignmentSubmitDialog from "../dialogs/AssignmentSubmitDialog";

const AssignmentUserStatus = (props) => {
    const [showSubmitData, setShowSubmitData] = useState(false);
    return <>
        <AssignmentSubmitDialog show={showSubmitData}
            author={props.author}
            submit={props.submit}
            onDismiss={() => { setShowSubmitData(false); }} />
        <div className="assignmentCell" onClick={() => { setShowSubmitData(true); }}>
            <div className="assignmentCellSurnameAndName">{`${props.author.surname}, ${props.author.name}`}</div>
            <div className="assignmentCellUsername">{props.author.username}</div>
            {props.submit !== undefined ?
                <div className="assignmentCellStatus assignmentOk">Entregado</div> :
                <div className="assignmentCellStatus assignmentKo">Sin entregar</div>}

        </div>
    </>
}

export default AssignmentUserStatus;