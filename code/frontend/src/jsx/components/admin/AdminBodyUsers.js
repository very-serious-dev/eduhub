import { useContext, useEffect, useState } from "react";
import UserCard from "../common/UserCard";
import { EduAPIFetch } from "../../../client/APIFetch";
import LoadingHUD from "../common/LoadingHUD";
import CreateUserDialog from "../dialogs/CreateUserDialog";
import { FeedbackContext } from "../../main/GlobalContainer";
import OptionsDialog from "../dialogs/OptionsDialog";
import EditUserDialog from "../dialogs/EditUserDialog";

const AdminBodyUsers = (props) => {
    const [users, setUsers] = useState([]);
    const [isRequestFailed, setRequestFailed] = useState(false);
    const [isLoading, setLoading] = useState(true);
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CREATE_USER, OPTIONS, EDIT_USER
    const [userForPopup, setUserForPopup] = useState();
    const [refreshKey, setRefreshKey] = useState(0);
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
    }, [refreshKey]);

    const onUserAdded = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Nuevo usuario creado con éxito" });
            setRefreshKey(x => x + 1);
            props.onShouldRefresh(); // Trigger /admin/home refresh; keep left pane number updated
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }


    const onUserEdited = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Usuario modificado con éxito" });
            setRefreshKey(x => x + 1);
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const onUserDeleted = (errorMessage) => {
        if (errorMessage === undefined) {
            setFeedback({ type: "success", message: "Usuario eliminado con éxito" });
            setRefreshKey(x => x + 1);
            props.onShouldRefresh();  // Trigger /admin/home refresh; keep left pane number updated
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const onUserClicked = (username) => {
        const user = users.find(u => u.username === username);
        setUserForPopup(user);
        setPopupShown("OPTIONS");
    }

    return isLoading ?
        <LoadingHUD /> :
        <>
            <div>
                <div className="adminAddButtonHeader pointable card" onClick={() => { setPopupShown("CREATE_USER") }}>➕ Añadir nuevo usuario</div>
            </div>
            {popupShown === "CREATE_USER" && <CreateUserDialog onDismiss={() => { setPopupShown("NONE") }}
                onUserAdded={onUserAdded}
                groups={props.groups} />}
            {popupShown === "OPTIONS" && <OptionsDialog onDismiss={() => { setPopupShown("NONE") }}
                options={[
                    {
                        label: "⚙️ Editar",
                        onClick: () => { setPopupShown("EDIT_USER"); }
                    }
                ]} />}
            {popupShown === "EDIT_USER" &&
                <EditUserDialog user={userForPopup}
                    onUserEdited={onUserEdited}
                    onUserDeleted={onUserDeleted}
                    onDismiss={() => { setPopupShown("NONE") }} />}
            {isRequestFailed ? <div>¡Vaya! Algo ha fallado 😔</div>
                : <div className="adminSubpanelList">
                    {users.map(u => { return <UserCard user={u} onClickWithUsername={onUserClicked} /> })}
                </div>
            }
        </>
}

export default AdminBodyUsers;