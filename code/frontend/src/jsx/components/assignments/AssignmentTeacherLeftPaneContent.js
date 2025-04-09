import AssignmentUserStatus from "./AssignmentUserStatus";

const AssignmentTeacherLeftPaneContent = (props) => {

    const numberAssigneesWhoDidntSubmit = () => {
        return props.assignmentData.assignees.reduce((acc, assignee) => {
            if (props.assignmentData.submits.some(s => s.author.username === assignee.username)) {
                return acc;
            }
            return acc + 1;
        }, 0);
    }

    const numberUnscoredSubmits = () => {
        return props.assignmentData.submits.reduce((acc, submit) => {
            if (submit.score) {
                return acc;
            }
            return acc + 1;
        }, 0);
    }

    const numberUnpublishedScores = () => {
        return props.assignmentData.submits.reduce((acc, submit) => {
            if (submit.score && submit.is_score_published === false) {
                return acc + 1;
            }
            return acc;
        }, 0);
    }

    const nAssigneesWhoDidntSubmit = numberAssigneesWhoDidntSubmit();
    const nUnscoredSubmits = numberUnscoredSubmits();
    const nUnpublishedScores = numberUnpublishedScores();

    const publishAll = () => {
        // TODO
    }

    return <>
        <div className="assignmentDetailLeftPaneInfoContainer">
            {nAssigneesWhoDidntSubmit > 0 && <div className="assignmentDetailLeftPaneInfo">
                ℹ️ No entregada por {nAssigneesWhoDidntSubmit} {nAssigneesWhoDidntSubmit > 1 ? "estudiantes" : "estudiante"}
            </div>}
            {nUnscoredSubmits > 0 && <div className="assignmentDetailLeftPaneInfo">
                ℹ️ No has calificado {nUnscoredSubmits} {nUnscoredSubmits > 1 ? "entregas" : "entrega"}
            </div>}
            {nUnpublishedScores > 0 && <><div className="assignmentDetailLeftPaneInfo">
                ⚠️ {nUnpublishedScores} {nUnpublishedScores > 1 ? "calificaciones están" : "calificación está"} sin publicar
            </div>
            <div onClick={publishAll} className="card assignmentTeacherPanePublishAll">
                Publicar todas
            </div>
            </>}
        </div>
        <div className="assignmentDetailLeftPaneTitle">
            💼 Trabajo de la clase
        </div>
        <div className="classDetailSectionUnderline" />
        {props.assignmentData.assignees.map(a => {
            const submit = props.assignmentData.submits.find(s => s.author.username === a.username)
            return <AssignmentUserStatus submit={submit}
                author={a}
                assignmentId={props.assignmentData.id}
                canEditScore={props.assignmentData.should_show_teacher_options}
                onScoreChanged={props.onScoreChanged} />
        })}
    </>
}

export default AssignmentTeacherLeftPaneContent;