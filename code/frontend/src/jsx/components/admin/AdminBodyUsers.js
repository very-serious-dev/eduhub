import { useEffect, useState } from "react";
import UserCard from "../common/UserCard";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import AdminAddUserForm from "./AdminAddUserForm";

const AdminBodyUsers = () => {
    const [users, setUsers] = useState([]);
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [showPopup, setShowPopup] = useState(false);
    console.log("rendering")
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

    }, []);

    return isLoading ?
        <LoadingHUD /> :
        <div>
            <div className="card adminAddUserCardButton" onClick={() => { setShowPopup(true) }}>➕ Añadir nuevo</div>
            <AdminAddUserForm show={showPopup} onDismiss={() => { setShowPopup(false) }}/>
            {isRequestFailed ? <div>¡Vaya! Algo ha fallado 😔</div>
                : users.map(u => { return <UserCard user={u} /> })
            }
        </div>
}

export default AdminBodyUsers;