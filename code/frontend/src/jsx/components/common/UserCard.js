const UserCard = (props) => {
    const contentForTags = () => {
        const tags = [];
        if (props.user.roles.includes("student")) {
            tags.push(<div className="userCardTag userCardTagStudent">ESTUDIANTE</div>)
            tags.push(<div className="userCardTag userCardTagStudentGroup">{props.user.student_group}</div>)
        }
        if (props.user.roles.includes("teacher")) {
            tags.push(<div className="userCardTag userCardTagTeacher">DOCENTE</div>)
        }
        if (props.user.roles.includes("school_leader")) {
            tags.push(<div className="userCardTag userCardTagSchoolLeader">DIRECCIÓN</div>)
        }
        if (props.user.roles.includes("sysadmin")) {
            tags.push(<div className="userCardTag userCardTagSysAdmin">ADMIN</div>)
        }
        return tags;
    }

    const onClick = () => {
        if (props.onClickWithUsername !== undefined) {
            props.onClickWithUsername(props.user.username);
        }
    }

    const onDelete = () => {
        props.onDeleteWithUsername(props.user.username);
    }

    return <div className={`card userCard ${props.onClickWithUsername !== undefined ? "cardClickable" : ""}`} key={props.user.username} onClick={onClick}>
        <div className="userCardUsername">{`${props.user.username}`}</div>
        <div className="userCardName">{`${props.user.name} ${props.user.surname}`}</div>
        <div className="userCardTagsContainer">
            {contentForTags()}
        </div>
        {props.onDeleteWithUsername && <div className="userCardDeleteButton" onClick={onDelete}>❌</div>}
    </div>
}

export default UserCard;