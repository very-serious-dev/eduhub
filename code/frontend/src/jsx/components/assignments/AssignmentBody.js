const AssignmentBody = (props) => {
    return <div>
        {props.assignmentData.title}
        {props.assignmentData.content}
    </div>
}

export default AssignmentBody;