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
                console.log(json);
            })
            .catch(error => {
                setLoading(false);
                setRequestFailed(true);
            })
    }, [newlyCreatedUsers]);

    const onUserAdded = (errorMessage) => {
        if (errorMessage === undefined) {
            setUserAddedFeedback(<div className="addUserResultMessage successColor">Nuevo usuario creado con éxito</div>);
            setNewlyCreatedUsers(value => value + 1);
        } else {
            setUserAddedFeedback(<div className="addUserResultMessage errorColor">{errorMessage}</div>);
        }
    }

    return isLoading ?
        <LoadingHUD /> :
        <div>
            <div className="adminUsersHeader">
                <div className="card adminAddUserCardButton" onClick={() => { setShowPopup(true) }}>➕ Añadir nuevo</div>
                {userAddedFeedback}
            </div>
            <AdminAddUserForm show={showPopup}
                onDismiss={() => { setShowPopup(false) }}
                onUserAdded={onUserAdded}
                groups={props.groups} />
            {isRequestFailed ? <div>¡Vaya! Algo ha fallado 😔</div>
                : <div className="adminUsersList">
                    {users.map(u => { return <UserCard user={u} /> })}
                </div>
            }
        </div>
}

export default AdminBodyUsers;