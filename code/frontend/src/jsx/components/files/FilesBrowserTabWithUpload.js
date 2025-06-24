import { useState } from "react";
import FilePicker from "../common/FilePicker";
import LoadingHUD from "../common/LoadingHUD";
import { DocuAPIFetch } from "../../../client/APIFetch";
import CreateFolderDialog from "../dialogs/CreateFolderDialog";

const FilesBrowserTabWithUpload = (props) => {
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [showCreateFolder, setShowCreateFolder] = useState(false);
    const [isUploading, setUploading] = useState(false);

    const onUpload = () => {
        if (isUploading) { return; }
        setUploading(true);
        const body = {
            filetree_info: {
                must_save_to_filetree: true,
                parent_folder_id: props.parentFolderId
            },
            files: filesToUpload
        }
        DocuAPIFetch("POST", "/api/v1/documents", body)
            .then(json => {
                if (json.success === true) {
                    props.onCreateSuccess(json.result);
                } else {
                    props.onCreateFail("Se ha producido un error");
                }
                setUploading(false);
                setFilesToUpload([]);
            })
            .catch(error => {
                setUploading(false);
                setFilesToUpload([]);
                props.onCreateFail(error.error ?? "Se ha producido un error");
            })
    }

    return <>
        {showCreateFolder && <CreateFolderDialog
            parentFolderId={props.parentFolderId}
            onDismiss={() => { setShowCreateFolder(false); }}
            onSuccess={props.onCreateSuccess}
            onFail={props.onCreateFail} />}
        <div className="filesBrowserTabWithUploadButton">
            <div className="filesBrowserCreateFolderButtonContainer">
                <div className="filesBrowserCreateFolderButton"
                    onClick={() => { setShowCreateFolder(true); }}>
                    Crear carpeta
                </div>
            </div>
            <div className="filesBrowserUploadSeparatorUnderline" />
            <FilePicker attachedFilesReady={filesToUpload} setAttachedFilesReady={setFilesToUpload} />
            {isUploading ? <div className="loadingHUDCentered"><LoadingHUD /></div>
                : filesToUpload.length > 0 && <div className="filesBrowserUploadFilesButton" onClick={onUpload}>⬆️ Subir</div>}
            {props.elements}
        </div>
    </>
}

export default FilesBrowserTabWithUpload;