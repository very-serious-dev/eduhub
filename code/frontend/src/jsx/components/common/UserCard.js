const UserCard = (props) => {
    const contentForTags = () => {
        const tags = [];
        if (props.user.roles.includes("student")) {
            tags.push(<div className="userCardTag userCardTagStudent">ESTUDIANTE</div>)
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

    return <div className="card userCard">
        <div className="userCardUsername">{`${props.user.username}`}</div>
        <div className="userCardName">{`${props.user.name} ${props.user.surname}`}</div>
        <div className="userCardTagsContainer">
            {contentForTags()}
        </div>
    </div>
}

export default UserCard;