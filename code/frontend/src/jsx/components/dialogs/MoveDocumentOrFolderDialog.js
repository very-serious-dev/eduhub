import { useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import FilesBrowser from "../files/FilesBrowser";
import { getStringPathForFolderIdsPath } from "../../../util/FilesBrowserContainerUtil";

const MoveDocumentOrFolderDialog = (props) => {
    const [selectedFolderIdsPath, setSelectedFolderIdsPath] = useState([]);
    const [isLoading, setLoading] = useState(false);

    const appropriateContainerFolderId = () => {
        return selectedFolderIdsPath.length > 0 ? selectedFolderIdsPath.slice(-1)[0] : null;
    }

    const onSubmitMoveElement = (event) => {
        event.preventDefault();
        setLoading(true);
        let url;
        let body = {}
        if (props.folderId) {
            url = `/api/v1/folders/${props.folderId}`;
            body["parent_folder_id"] = appropriateContainerFolderId();
        } else if (props.documentId) {
            url = `/api/v1/documents/${props.documentId}`;
            body["folder_id"] = appropriateContainerFolderId();
        }
        EduAPIFetch("PUT", url, body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onSuccess(json.result);
                    setSelectedFolderIdsPath([]);
                } else {
                    props.onFail("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onFail(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return props.show === true ? <div className="popupOverlayBackground" onClick={(e) => { e.stopPropagation(); props.onDismiss()}}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Carpeta de destino</div>
                <form onSubmit={onSubmitMoveElement}>
                    <div className="dialogScrollableFixedHeightSection">
                        <FilesBrowser myFilesTree={props.myFilesTree}
                            selectedFolderIdsPath={selectedFolderIdsPath}
                            setSelectedFolderIdsPath={setSelectedFolderIdsPath}
                            browserMode={"MOVE_DIALOG"} />
                    </div>
                    <div className="formInput">
                        <input className="formInputGreyBackground"
                            type="text"
                            value={getStringPathForFolderIdsPath(selectedFolderIdsPath, props.myFilesTree)} disabled={true} />
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value="Mover"/>
                    </div>
                    {isLoading && <div className="dialogScreenHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div> : <></>
}

export default MoveDocumentOrFolderDialog;