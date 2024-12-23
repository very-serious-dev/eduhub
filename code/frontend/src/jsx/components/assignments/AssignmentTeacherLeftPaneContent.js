import AssignmentUserStatus from "./AssignmentUserStatus";

const AssignmentTeacherLeftPaneContent = (props) => {
    return <>
        <div className="assignmentDetailLeftPaneTitle">
            💼 Trabajo de la clase
        </div>
        <div className="classDetailSectionUnderline" />
        {props.assignmentData.assignees.map(a => {
            const submit = props.assignmentData.submits.find(s => s.author.username === a.username)
            return <AssignmentUserStatus submit={submit} author={a}/>
        })}
    </>
}

export default AssignmentTeacherLeftPaneContent;