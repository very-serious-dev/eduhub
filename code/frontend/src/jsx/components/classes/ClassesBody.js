import { useContext, useState } from "react";
import GroupClassesSection from "./GroupClassesSection";
import EduAPIFetch from "../../../client/EduAPIFetch";
import CreateClassDialog from "../dialogs/CreateClassDialog";
import GetRolesFromCookie from "../../../client/GetRolesFromCookie";
import { FeedbackContext } from "../../main/GlobalContainer";

const ClassesBody = (props) => {
    const [showAddClassPopup, setShowAddClassPopup] = useState(false);
    const [isLoadingAllGroups, setLoadingAllGroups] = useState(false);
    const [allGroups, setAllGroups] = useState([]);
    const setFeedback = useContext(FeedbackContext);
    const roles = GetRolesFromCookie();

    const onClickAddClass = () => {
        if (isLoadingAllGroups) { return; }
        if (allGroups.length > 0) {
            setShowAddClassPopup(true);
            return;
        }

        setLoadingAllGroups(true);
        EduAPIFetch("GET", "/api/v1/groups")
            .then(json => {
                setLoadingAllGroups(false);
                setAllGroups(json.groups);
                setShowAddClassPopup(true);
            })
            .catch(error => {
                setLoadingAllGroups(false);
                setFeedback({ type: "error", message: "Ha habido un error cargando los grupos" })
            })
    }

    return <div>
        <CreateClassDialog show={showAddClassPopup}
            onDismiss={() => { setShowAddClassPopup(false) }}
            onClassAdded={props.onClassAdded}
            groups={allGroups}
            automaticallyAddTeacher={true} />
        {props.groups.map(g => {
            const classes = props.classes.filter(c => c.group === g.tag)
            return <GroupClassesSection groupTag={g.tag} latestUpdate={g.latest_update} classes={classes} />
        })}
        {roles.includes("teacher") === true &&
            <div className="card floatingCardAddNew" onClick={onClickAddClass}>{isLoadingAllGroups ? "Cargando..." : "➕ Añadir clase"}</div>}
    </div>
}

export default ClassesBody;