import { useContext, useState } from "react";
import CreateFolderOrUploadFileDialog from "../dialogs/CreateFolderOrUploadFileDialog";
import CreateFolderDialog from "../dialogs/CreateFolderDialog";
import { FeedbackContext } from "../../main/GlobalContainer";
import UploadDocumentsDialog from "../dialogs/UploadDocumentsDialog";
import FilesBrowser from "./FilesBrowser";
import { getStringPathForFolderIdsPath } from "../../../util/FilesBrowserContainerUtil";

const FilesBody = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CREATE_OR_UPLOAD, CREATE_FOLDER, UPLOAD_DOCUMENTS
    const [currentFolderIdsPath, setCurrentFolderIdsPath] = useState([]);
    const setFeedback = useContext(FeedbackContext);

    const onFolderOrDocumentsChanged = (result) => {
        setFeedback({ type: "success", message: "Completado con éxito" });
        props.onFilesChanged(result);
    }

    const onMoveDeleteSuccess = (result) => {
        fallbackToPreviousFolderIfCurrentWasMovedOrDeleted(result, currentFolderIdsPath, setCurrentFolderIdsPath);
        onFolderOrDocumentsChanged(result);
    }

    const fallbackToPreviousFolderIfCurrentWasMovedOrDeleted = (moveOrDeleteResult) => {
        if (moveOrDeleteResult.operation === "folder_changed") {
            const folderLevel = currentFolderIdsPath.indexOf(moveOrDeleteResult.folder.id);
            if (folderLevel !== -1) {
                setCurrentFolderIdsPath(currentFolderIdsPath.slice(0, folderLevel));
            }
        } else if (moveOrDeleteResult.operation === "files_deleted") {
            let folderLevel = Number.MAX_VALUE
            moveOrDeleteResult.removed_folders_ids.forEach(oneFolderIdThatWasRemoved => {
                folderLevel = Math.min(folderLevel, currentFolderIdsPath.indexOf(oneFolderIdThatWasRemoved))
            });
            if (folderLevel !== Number.MAX_VALUE) {
                setCurrentFolderIdsPath(currentFolderIdsPath.slice(0, folderLevel));
            }
        }
    }

    return <div>
        <CreateFolderOrUploadFileDialog show={popupShown === "CREATE_OR_UPLOAD"}
            onDismiss={() => { setPopupShown("NONE") }}
            onCreateFolderClicked={() => { setPopupShown("CREATE_FOLDER") }}
            onUploadDocumentsClicked={() => { setPopupShown("UPLOAD_DOCUMENTS") }} />
        <CreateFolderDialog show={popupShown === "CREATE_FOLDER"}
            parentFolderStringPath={getStringPathForFolderIdsPath(currentFolderIdsPath, props.myFilesTree)}
            parentFolderIdsPath={currentFolderIdsPath}
            onDismiss={() => { setPopupShown("NONE") }}
            onSuccess={onFolderOrDocumentsChanged}
            onFail={(errorMessage) => { setFeedback({ type: "error", message: errorMessage }); }} />
        <UploadDocumentsDialog show={popupShown === "UPLOAD_DOCUMENTS"}
            parentFolderStringPath={getStringPathForFolderIdsPath(currentFolderIdsPath, props.myFilesTree)}
            parentFolderIdsPath={currentFolderIdsPath}
            onDismiss={() => { setPopupShown("NONE") }}
            onSuccess={onFolderOrDocumentsChanged}
            onFail={(errorMessage) => { setFeedback({ type: "error", message: errorMessage }); }} />
        <FilesBrowser myFilesTree={props.myFilesTree}
            selectedFolderIdsPath={currentFolderIdsPath}
            setSelectedFolderIdsPath={setCurrentFolderIdsPath}
            canClickFiles={true}
            showContextMenus={true}
            onMoveDeleteSuccess={onMoveDeleteSuccess}
            onMoveDeleteFail={(errorMessage) => { setFeedback({ type: "error", message: errorMessage }); }} />
        <div className="card floatingCardAddNew" onClick={() => { setPopupShown("CREATE_OR_UPLOAD") }}>➕ Nuevo</div>
    </div>
}

export default FilesBody;