import { useContext, useEffect, useState } from "react";
import UserCard from "../common/UserCard";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import CreateUserDialog from "../dialogs/CreateUserDialog";
import { FeedbackContext } from "../../main/GlobalContainer";

const AdminBodyUsers = (props) => {
    const [users, setUsers] = useState([]);
    const [newlyCreatedUsers, setNewlyCreatedUsers] = useState(0); // refresh key
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const setFeedback = useContext(FeedbackContext);

    useEffect(() => {
        EduAPIFetch("GET", "/api/v1/users")
            .then(json => {
                setLoading(false);
                setUsers(json.users);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
            })
    }, [newlyCreatedUsers]);
    const onUserAdded = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({type: "success", message: "Nuevo usuario creado con éxito"});
            setNewlyCreatedUsers(value => value + 1);
            {/*
              TO-DO: Possible optimization: Instead of triggering a /admin/home refresh,
              manually set a +1. In the end, this just aims to keep the left panel
              number updated
             */}
            props.onShouldRefresh();
        } else {
            setFeedback({type: "error", message: errorMessage});
        }
    }

    return isLoading ?
        <LoadingHUD /> :
        <>
            <div>
                <div className="card adminAddButtonHeader" onClick={() => { setShowPopup(true) }}>➕ Añadir nuevo usuario</div>
            </div>
            <CreateUserDialog show={showPopup}
                onDismiss={() => { setShowPopup(false) }}
                onUserAdded={onUserAdded}
                groups={props.groups} />
            {isRequestFailed ? <div>¡Vaya! Algo ha fallado 😔</div>
                : <div className="adminSubpanelList">
                    {users.map(u => { return <UserCard user={u} /> })}
                </div>
            }
        </>
}

export default AdminBodyUsers;