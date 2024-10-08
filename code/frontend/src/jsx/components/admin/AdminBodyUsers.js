import { useEffect, useState } from "react";
import UserCard from "../common/UserCard";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import AdminAddUserForm from "./AdminAddUserForm";

const AdminBodyUsers = (props) => {
    const [users, setUsers] = useState([]);
    const [newlyCreatedUsers, setNewlyCreatedUsers] = useState(0); // refresh key
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    const [userAddedFeedback, setUserAddedFeedback] = useState(<div />);

    useEffect(() => {
        const options = {
            method: "GET",
            credentials: "include"
        };
        EduAPIFetch("/api/v1/admin/users", options)
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
            setUserAddedFeedback(<div className="adminAddResultMessage successColor">Nuevo usuario creado con éxito</div>);
            setNewlyCreatedUsers(value => value + 1);
            {/*
              TO-DO: Possible optimization: Instead of triggering a /admin/home refresh,
              manually set a +1. In the end, this just aims to keep the left panel
              number updated
             */}
            props.onShouldRefresh();
        } else {
            setUserAddedFeedback(<div className="adminAddResultMessage errorColor">{errorMessage}</div>);
        }
    }

    return isLoading ?
        <LoadingHUD /> :
        <>
            <div className="adminSubpanelHeader">
                <div className="card adminAddButtonHeader" onClick={() => { setShowPopup(true) }}>➕ Añadir nuevo usuario</div>
                {userAddedFeedback}
            </div>
            <AdminAddUserForm show={showPopup}
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