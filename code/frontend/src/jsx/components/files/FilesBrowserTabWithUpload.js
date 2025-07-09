import { useState } from "react";
import FilePicker from "../common/FilePicker";
import LoadingHUD from "../common/LoadingHUD";
import { DocuAPIFetch } from "../../../client/APIFetch";
import CreateFolderDialog from "../dialogs/CreateFolderDialog";
import OptionsDialog from "../dialogs/OptionsDialog";

const FilesBrowserTabWithUpload = (props) => {
    const [filesToUpload, setFilesToUpload] = useState([]);
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CREATE_FOLDER_OR_QUESTIONNAIRE, CREATE_FOLDER
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
        {popupShown === "CREATE_FOLDER" && <CreateFolderDialog
            parentFolderId={props.parentFolderId}
            onDismiss={() => { setPopupShown("NONE"); }}
            onSuccess={props.onCreateSuccess}
            onFail={props.onCreateFail} />}
        {popupShown === "CREATE_FOLDER_OR_QUESTIONNAIRE" && <OptionsDialog onDismiss={() => { setPopupShown("NONE") }}
            options={[
                {
                    label: "📁 Crear carpeta",
                    onClick: () => { setPopupShown("CREATE_FOLDER") },
                },
                {
                    label: "📝 Nuevo formulario",
                    onClick: () => { alert("TO-DO") },
                },
            ]} />}
        <div className="filesBrowserTabWithUploadButton">
            <div className="filesBrowserCreateFolderButtonContainer">
                <div className="filesBrowserCreateFolderButton"
                    onClick={() => { setPopupShown("CREATE_FOLDER_OR_QUESTIONNAIRE"); }}>
                    Crear... 📁📝
                </div>
            </div>
            <div className="filesBrowserUploadSeparatorUnderline" />
            <FilePicker files={filesToUpload} setFiles={setFilesToUpload} showChooseFromMyUnit={false} />
            {isUploading ? <div className="loadingHUDCentered"><LoadingHUD /></div>
                : filesToUpload.length > 0 && <div className="filesBrowserUploadFilesButton" onClick={onUpload}>⬆️ Subir</div>}
            {props.elements}
        </div>
    </>
}

export default FilesBrowserTabWithUpload;