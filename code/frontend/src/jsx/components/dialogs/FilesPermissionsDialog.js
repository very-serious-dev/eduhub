import { useContext, useEffect, useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import { FeedbackContext } from "../../main/GlobalContainer";
import UserCard from "../common/UserCard";
import SearchUsersSubDialog from "./SearchUsersSubDialog";
import AreYouSureDialog from "./AreYouSureDialog";
import { GetSessionUsername } from "../../../client/ClientCache";

const FilesPermissionsDialog = (props) => {
    const [isLoading, setLoading] = useState(false);
    const [isLoadingDelete, setLoadingDelete] = useState(false);
    const [areYouSureDeleteUsername, setAreYouSureDeleteUsername] = useState(undefined);
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
            setFeedback({ type: "error", message: errorMessage });
        }
    }

    const getSelfAndChildrenIdsForQueryParam = () => {
        let queryParam = "";
        if (props.subTreeIds.document_ids.length > 0) {
            queryParam += "?documentIds=" + props.subTreeIds.document_ids.join(",");
        }
        if (props.subTreeIds.folder_ids.length > 0) {
            queryParam += (queryParam.length > 0) ? "&" : "?";
            queryParam += "folderIds=" + props.subTreeIds.folder_ids.join(",");
        }
        return queryParam;
    }

    const filePermissionsSubTreeUrl = () => {
        return `/api/v1/files/permissions${getSelfAndChildrenIdsForQueryParam()}`;
    }

    return props.show === true ?
        areYouSureDeleteUsername !== undefined ?
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
                            {isLoading && <div className="dialogScreenHUDCentered"><LoadingHUD /></div>}
                            <div className="participantsContainer">
                                {users && users.length > 0 ? users.map(u => <UserCard user={u} onDeleteWithUsername={onRemoveUserClicked} />) : <div className="emptyParticipants">No has dado permisos de lectura a nadie para este fichero.<br /></div>}
                            </div>
                            <div className="card addParticipant pointable" onClick={() => { setShowAddUsers(true); }}>➕ Añadir usuarios</div>
                        </div>
                    </div>
                </div> : <></>
}

export default FilesPermissionsDialog;