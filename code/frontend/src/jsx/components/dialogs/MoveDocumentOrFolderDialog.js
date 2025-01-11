import { useState } from "react";
import EduAPIFetch from "../../../client/EduAPIFetch";
import LoadingHUD from "../common/LoadingHUD";
import { FilesBrowser, getStringPathForFolderIdsPath } from "../files/FilesBrowser";

const MoveDocumentOrFolderDialog = (props) => {
    const [selectedFolderIdsPath, setSelectedFolderIdsPath] = useState("");
    const [isLoading, setLoading] = useState(false);

    const onSubmitMoveElement = (event) => {
        event.preventDefault();
        setLoading(true);
        let body = {}
        if (selectedFolderIdsPath.length > 0) {
            body["parent_folder_id"] = selectedFolderIdsPath.slice(-1)[0];
        }
        /*
        EduAPIFetch("POST", "/api/v1/folders", body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onSuccess(json.result);
                    setFormFolderName("");
                } else {
                    props.onFail("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onFail(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })*/
    }

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Carpeta de destino</div>
                <form onSubmit={onSubmitMoveElement}>
                    <div className="dialogScrollableSection">
                    <FilesBrowser myFilesTree={props.myFilesTree}
                        onFolderPathSelected={(idsPath) => { setSelectedFolderIdsPath(idsPath); }}
                        canClickFiles={false}
                        showContextMenus={false} />

                    </div>
                    <div className="formInput">
                        <input className="formInputGreyBackground"
                            type="text"
                            value={getStringPathForFolderIdsPath(selectedFolderIdsPath, props.myFilesTree)} disabled={true} />
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value="Mover" />
                    </div>
                    {isLoading && <div className="dialogScreenHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div> : <></>
}

export default MoveDocumentOrFolderDialog;