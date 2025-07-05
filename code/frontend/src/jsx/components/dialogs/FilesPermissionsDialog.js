import { useContext, useEffect, useState } from "react";
import { EduAPIFetch } from "../../../client/APIFetch";
import LoadingHUD from "../common/LoadingHUD";
import { FeedbackContext } from "../../main/GlobalContainer";
import UserCard from "../common/UserCard";
import SearchUsersSubDialog from "./SearchUsersSubDialog";
import AreYouSureDialog from "./AreYouSureDialog";
import { GetSessionUsername } from "../../../client/ClientCache";
import { getSelfAndSubTreeIds, getSelfAndSubTreeIdsForQueryParam } from "../../../util/FilesBrowserContainerUtil";

const FilesPermissionsDialog = (props) => {
    const [isLoading, setLoading] = useState(false);
    const [isLoadingDelete, setLoadingDelete] = useState(false);
    const [areYouSureDeleteUsername, setAreYouSureDeleteUsername] = useState(undefined);
    const [showAddUsers, setShowAddUsers] = useState(false);
    const [users, setUsers] = useState([])
    const [refreshKey, setRefreshKey] = useState(0);
    const setFeedback = useContext(FeedbackContext);

    useEffect(() => {
        setLoading(true);
        let url;
        if (props.folder) {
            url = `/api/v1/folders/${props.folder.id}/users`;
        } else if (props.document) {
            url = `/api/v1/documents/${props.document.identifier}/users`;
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
    }, [refreshKey]);

    const onRemoveUserClicked = (username) => {
        setAreYouSureDeleteUsername(username);
    }

    // TODO: FilePermissionsDialog is very similar to ClassParticipantsDialog... refactor?
    const onRemoveUserActionConfirmed = () => {
        if (isLoadingDelete) { return; }
        setLoadingDelete(true);
        EduAPIFetch("DELETE", filePermissionsSubTreeUrl(), { username: areYouSureDeleteUsername })
            .then(json => {
                setLoadingDelete(false);
                setAreYouSureDeleteUsername(undefined); // Dismisses Are you sure? dialog
                if (json.success === true) {
                    setFeedback({ type: "success", message: "El usuario ya no tiene acceso" });
                } else {
                    setFeedback({ type: "error", message: "Se ha producido un error" });
                }
                setRefreshKey(x => x + 1);
            })
            .catch(error => {
                setLoadingDelete(false);
                setAreYouSureDeleteUsername(undefined); // Dismisses Are you sure? dialog
                setFeedback({ type: "error", message: error.error ?? "Se ha producido un error" });
            })
    }

    const onUserAdded = (errorMessage) => {
        setRefreshKey(x => x + 1)
        // TODO: Both here and in ClassParticipantsDialog - show yellow (warning)
        // Feedback message instead of red (error) one, when there's a partial success
        // Also it'd be great to show the green (success) one too, like, on top of the
        // other one
        if (errorMessage === undefined || errorMessage === "") {
            setFeedback({ type: "success", message: "Usuario(s) añadido(s) con éxito" });
        } else {
            setFeedback({ type: "info", message: errorMessage });
        }
    }

    const filePermissionsSubTreeUrl = () => {
        return `/api/v1/files/permissions${getSelfAndSubTreeIdsForQueryParam(props.document, props.folder)}`;
    }

    return areYouSureDeleteUsername !== undefined ?
        <AreYouSureDialog onActionConfirmed={onRemoveUserActionConfirmed}
            onDismiss={() => { setAreYouSureDeleteUsername(undefined); }}
            isLoading={isLoadingDelete}
            dialogMode="DELETE"
            warningMessage={`¿Deseas retirar el acceso para ${areYouSureDeleteUsername}?${props.folderId !== undefined ? " Ya no podrá acceder a la carpeta ni a ningún elemento contenido en ella" : ""}`} />
        : showAddUsers ?
            <SearchUsersSubDialog addUsersUrl={filePermissionsSubTreeUrl()}
                dialogTitle={`Dar acceso a`}
                onUserAdded={onUserAdded}
                onDismiss={() => { setShowAddUsers(false) }}
                usersToIgnore={[GetSessionUsername()]} />
            : <div className="popupOverlayBackground" onClick={(e) => { e.stopPropagation(); props.onDismiss() }}>
                <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
                    <div className="card dialogBackground">
                        <div className="dialogTitle">{props.title}</div>
                        {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                        <div className="participantsContainer">
                            {users && users.length > 0 ? users.map(u => <UserCard user={u} onDeleteWithUsername={onRemoveUserClicked} />) : <div className="emptyParticipants">No has dado permisos de lectura a nadie para este fichero.<br /></div>}
                        </div>
                        <div className="card addParticipant pointable primaryBlue pointableSecondaryBlue" onClick={() => { setShowAddUsers(true); }}>➕ Añadir usuarios</div>
                    </div>
                </div>
            </div>
}

export default FilesPermissionsDialog;