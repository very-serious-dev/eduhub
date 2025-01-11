import { useContext, useState } from "react";
import CreateFolderOrUploadFileDialog from "../dialogs/CreateFolderOrUploadFileDialog";
import CreateFolderDialog from "../dialogs/CreateFolderDialog";
import { FeedbackContext } from "../../main/GlobalContainer";
import UploadDocumentsDialog from "../dialogs/UploadDocumentsDialog";
import { FilesBrowser, getStringPathForFolderIdsPath } from "./FilesBrowser";

const FilesBody = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CREATE_OR_UPLOAD, CREATE_FOLDER, UPLOAD_DOCUMENTS
    const [currentFolderIdsPath, setCurrentFolderIdsPath] = useState([]);
    const setFeedback = useContext(FeedbackContext);

    const onFolderOrDocumentsCreated = (result) => {
        setFeedback({ type: "success", message: "Completado con éxito" });
        props.onFilesChanged(result);
    }

    return <div>
        <CreateFolderOrUploadFileDialog show={popupShown === "CREATE_OR_UPLOAD"}
            onDismiss={() => { setPopupShown("NONE") }}
            onCreateFolderClicked={() => { setPopupShown("CREATE_FOLDER") }}
            onUploadDocumentsClicked={() => { setPopupShown("UPLOAD_DOCUMENTS")}} />
        <CreateFolderDialog show={popupShown === "CREATE_FOLDER"}
            parentFolderStringPath={getStringPathForFolderIdsPath(currentFolderIdsPath, props.myFilesTree)}
            parentFolderIdsPath={currentFolderIdsPath}
            onDismiss={() => { setPopupShown("NONE") }}
            onSuccess={onFolderOrDocumentsCreated}
            onFail={(errorMessage) => { setFeedback({ type: "error", message: errorMessage }); }} />
        <UploadDocumentsDialog show={popupShown === "UPLOAD_DOCUMENTS"}
            parentFolderStringPath={getStringPathForFolderIdsPath(currentFolderIdsPath, props.myFilesTree)}
            parentFolderIdsPath={currentFolderIdsPath}
            onDismiss={() => { setPopupShown("NONE") }}
            onSuccess={onFolderOrDocumentsCreated}
            onFail={(errorMessage) => { setFeedback({ type: "error", message: errorMessage }); }} />
        <FilesBrowser myFilesTree={props.myFilesTree}
            onFolderPathSelected={(idsPath) => { setCurrentFolderIdsPath(idsPath); }}
            foldersCount={props.foldersCount}
            documentsCount={props.documentsCount}
            canClickFiles={true}
            showContextMenus={true} />
        <div className="card floatingCardAddNew" onClick={() => { setPopupShown("CREATE_OR_UPLOAD") }}>➕ Nuevo</div>
    </div>
}

export default FilesBody;