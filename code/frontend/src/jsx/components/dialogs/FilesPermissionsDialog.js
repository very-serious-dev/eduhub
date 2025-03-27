import { useContext, useEffect, useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import { FeedbackContext } from "../../main/GlobalContainer";
import UserCard from "../common/UserCard";

const FilesPermissionsDialog = (props) => {
    const [isLoading, setLoading] = useState(false);
    const [users, setUsers] = useState([])
    const setFeedback = useContext(FeedbackContext);

    useEffect(()=>{
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
    }, [props.show]);


    return props.show === true ? <div className="popupOverlayBackground"  onClick={(e) => { e.stopPropagation(); props.onDismiss()}}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Compartido con...</div>
                {isLoading && <div className="dialogScreenHUDCentered"><LoadingHUD /></div>}
                <div className="participantsContainer">
                    {users && users.length > 0 ? users.map(u => <UserCard user={u} onDeleteWithUsername={(username) => {}} />) : <div className="emptyParticipants">No has dado permisos de lectura a nadie para este fichero. Sólo puedes acceder tú, y, en caso de que lo hayas adjuntado en una clase o tarea, aquellas personas que necesitan poder verlo</div>}
                </div>
                {/*
                <form onSubmit={onSubmitMoveElement}>
                    <div className="dialogScrollableFixedHeightSection">
                        <FilesBrowser myFilesTree={props.myFilesTree}
                            selectedFolderIdsPath={selectedFolderIdsPath}
                            setSelectedFolderIdsPath={setSelectedFolderIdsPath}
                            canClickFiles={false}
                            showContextMenus={false} />
                    </div>
                    <div className="formInput">
                        <input className="formInputGreyBackground"
                            type="text"
                            value={getStringPathForFolderIdsPath(selectedFolderIdsPath, props.myFilesTree)} disabled={true} />
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value="Mover" disabled={props.documentId && selectedFolderIdsPath.length === 0}/>
                    </div>
                    {isLoading && <div className="dialogScreenHUDCentered"><LoadingHUD /></div>}
                </form>*/}
            </div>
        </div>
    </div> : <></>
}

export default FilesPermissionsDialog;