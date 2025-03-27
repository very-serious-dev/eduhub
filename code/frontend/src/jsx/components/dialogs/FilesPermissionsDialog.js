import { useContext, useEffect, useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import { FeedbackContext } from "../../main/GlobalContainer";
import UserCard from "../common/UserCard";
import SearchUsersSubDialog from "./SearchUsersSubDialog";

const FilesPermissionsDialog = (props) => {
    const [isLoading, setLoading] = useState(false);
    const [showAddUsers, setShowAddUsers] = useState(false);
    const [users, setUsers] = useState([])
    const [refreshKey, setRefreshKey] = useState(0);
    const setFeedback = useContext(FeedbackContext);

    useEffect(() => {
        if (props.show !== true) { return; }
        setLoading(true);
        let url;
        if (props.folderId) {
            url = `/api/v1/folders/${props.folderId}/users`;
        } else if (props.documentId) {
            url = `/api/v1/documents/${props.documentId}/users`;
        }
        EduAPIFetch("GET", url).then(json => {
            setLoading(false);
            if (json.success === true) {
                setUsers(json.users);
            } else {
                setFeedback({ type: "error", message: "Se ha producido un error" });
            }
        })
            .catch(error => {
                setLoading(false);
                setFeedback({ type: "error", message: error.error ?? "Se ha producido un error" });
            })
    }, [props.show, refreshKey]);

    const onUserAdded = (errorMessage) => {
        setRefreshKey(x => x + 1)
        if (errorMessage === undefined || errorMessage === "") {
            setFeedback({ type: "success", message: "Usuario(s) añadido(s) con éxito" });
        } else {
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    return props.show === true ?
        showAddUsers ? 
            <SearchUsersSubDialog classroom={props.classroom /* TODO: Work this out */}
                onUserAdded={onUserAdded}
                onDismiss={() => { setShowAddUsers(false) }} />
            : <div className="popupOverlayBackground" onClick={(e) => { e.stopPropagation(); props.onDismiss() }}>
                <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
                    <div className="card dialogBackground">
                        <div className="dialogTitle">Compartido con...</div>
                        {isLoading && <div className="dialogScreenHUDCentered"><LoadingHUD /></div>}
                        <div className="participantsContainer">
                            {users && users.length > 0 ? users.map(u => <UserCard user={u} onDeleteWithUsername={(username) => { }} />) : <div className="emptyParticipants">No has dado permisos de lectura a nadie para este fichero.<br/>Sólo es accesible para:<br/><ul><li>Personas en clases donde esté compartido</li><li>Profesores de clases donde esté anexado a una tarea</li><li>Quien lo creó (tú)</li></ul></div>}
                        </div>
                        <div className="card addParticipant" onClick={() => { setShowAddUsers(true); }}>➕ Añadir usuarios</div>
                    </div>
                </div>
            </div> : <></>
}

export default FilesPermissionsDialog;