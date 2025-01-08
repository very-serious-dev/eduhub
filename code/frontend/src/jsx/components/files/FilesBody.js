import { useContext, useState } from "react";
import FilesBrowser from "./FilesBrowser";
import CreateFolderOrUploadFileDialog from "../dialogs/CreateFolderOrUploadFileDialog";
import CreateFolderDialog from "../dialogs/CreateFolderDialog";
import { FeedbackContext } from "../../main/GlobalContainer";

const FilesBody = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CREATE_OR_UPLOAD, CREATE_FOLDER
    const [createFolderDialogInitialPosition, setCreateFolderDialogInitialPosition] = useState([]);
    const setFeedback = useContext(FeedbackContext);

    const onFolderAdded = (result) => {
        setFeedback({ type: "success", message: "Completado con éxito" });
        props.onFilesChanged(result);
    }

    const onFolderPathSelected = (idsPath) => {
        setCreateFolderDialogInitialPosition(idsPath);
    }

    return <div>
        <CreateFolderOrUploadFileDialog show={popupShown === "CREATE_OR_UPLOAD"}
            onDismiss={() => { setPopupShown("NONE") }}
            onCreateFolderClicked={() => { setPopupShown("CREATE_FOLDER") }}
            onUploadDocumentsClicked={() => { }} />
        <CreateFolderDialog show={popupShown === "CREATE_FOLDER"}
            onDismiss={() => { setPopupShown("NONE") }}
            onSuccess={onFolderAdded}
            onFail={(errorMessage) => { setFeedback({ type: "error", message: errorMessage }); }}
            myFilesTree={props.myFilesTree}
            initialPosition={createFolderDialogInitialPosition}
            foldersCount={props.foldersCount}
            documentsCount={props.documentsCount} />
        <FilesBrowser myFilesTree={props.myFilesTree}
            initialPosition={[]}
            onFolderPathSelected={onFolderPathSelected}
            foldersCount={props.foldersCount}
            documentsCount={props.documentsCount}
            canClickFiles={true} />
        <div className="card floatingCardAddNew" onClick={() => { setPopupShown("CREATE_OR_UPLOAD") }}>➕ Nuevo</div>
    </div>
}

export default FilesBody;