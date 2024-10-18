import { useContext, useState } from "react";
import GroupClassesSection from "./GroupClassesSection";
import EduAPIFetch from "../../../client/EduAPIFetch";
import CreateClassDialog from "../dialogs/CreateClassDialog";
import GetRolesFromCookie from "../../../client/GetRolesFromCookie";
import { FeedbackContext } from "../../main/GlobalContainer";

const ClassesBody = (props) => {
    const [showAddClassPopup, setShowAddClassPopup] = useState(false);
    const [isLoadingGroups, setLoadingGroups] = useState(false);
    const [groups, setGroups] = useState([]);
    const setFeedback = useContext(FeedbackContext);
    const roles = GetRolesFromCookie();

    const sections = () => {
        // Elegant reduce (I hope so) to transform an array like this:
        //
        // [{"name": "Philosophy", "group": "BACH1"},
        //  {"name": "Chemistry", "group": "BACH1"},
        //  {"name": "Maths", "group": "BACH2"}]
        //
        // ...into this:
        // {
        //   "BACH1": [{"name": "Philosophy", "group": "BACH1"},
        //             {"name": "Chemistry", "group": "BACH1"}],
        //   "BACH2": [{"name": "Maths", "group": "BACH2"}]
        // }
        // ...so that it can be easily presented in different sections.
        return props.classes.reduce(
            (groups, currentClass) => {
                if (!(currentClass.group in groups)) {
                    groups[currentClass.group] = []
                }
                groups[currentClass.group].push(currentClass);
                return groups
            }, {})
    }

    const onClickAddClass = () => {
        if (isLoadingGroups) { return; }
        if (groups.length > 0) {
            setShowAddClassPopup(true);
            return;
        }

        const options = {
            method: "GET",
            credentials: "include"
        };
        setLoadingGroups(true);
        EduAPIFetch("/api/v1/groups", options)
            .then(json => {
                setLoadingGroups(false);
                setGroups(json.groups);
                setShowAddClassPopup(true);
            })
            .catch(error => {
                setLoadingGroups(false);
                setFeedback({type: "error", message: "Ha habido un error cargando los grupos"})
            })
    }

    return <div className="mainBodyClasses">
        <CreateClassDialog show={showAddClassPopup}
                onDismiss={() => { setShowAddClassPopup(false) }}
                onClassAdded={ () => { props.onClassAdded(); }}
                groups={groups} 
                automaticallyAddTeacher={true} /> 
        {Object.entries(sections()).map(([groupTag, classes])=> {
            return <GroupClassesSection group={groupTag}
                classes={classes} />
        })}
        { roles.includes("teacher") === true &&
        <div className="card classesAddNew" onClick={() => { onClickAddClass() }}>{ isLoadingGroups ? "Cargando..." : "➕ Añadir clase" }</div> }
    </div>
}

export default ClassesBody;