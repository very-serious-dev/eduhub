import { useContext, useState } from "react";
import CreateFolderDialog from "../dialogs/CreateFolderDialog";
import { FeedbackContext } from "../../main/GlobalContainer";
import UploadDocumentsDialog from "../dialogs/UploadDocumentsDialog";
import FilesBrowser from "./FilesBrowser";
import { getStringPathForFolderIdsPath } from "../../../util/FilesBrowserContainerUtil";
import MyFilesFirstTabContent from "./MyFilesFirstTabContent";
import SharedFilesFirstTabContent from "./SharedFilesFirstTabContent";
import OptionsDialog from "../dialogs/OptionsDialog";

const FilesBody = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, CREATE_OR_UPLOAD, CREATE_FOLDER, UPLOAD_DOCUMENTS
    const [currentFolderIdsPath, setCurrentFolderIdsPath] = useState([]);
    const [selectedRoot, setSelectedRoot] = useState("MY_FILES"); // MY_FILES, SHARED_WITH_ME
    const setFeedback = useContext(FeedbackContext);

    const onRootClicked = (root) => {
        setSelectedRoot(root);
        setCurrentFolderIdsPath([]);
    }

    const onFolderOrDocumentsChanged = (result) => {
        setFeedback({ type: "success", message: "Completado con éxito" });
        props.onMyFilesChanged(result);
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

    const getTree = () => {
        if (selectedRoot === "MY_FILES") {
            return props.myFilesTree;
        } else if (selectedRoot === "SHARED_WITH_ME") {
            return props.sharedFilesTree;
        }
    }

    const firstTabView = () => {
        return <div>
            <MyFilesFirstTabContent myFilesTree={props.myFilesTree}
                isSelected={selectedRoot === "MY_FILES"}
                onRootClicked={onRootClicked} />
            <SharedFilesFirstTabContent sharedFilesTree={props.sharedFilesTree}
                isSelected={selectedRoot === "SHARED_WITH_ME"}
                onRootClicked={onRootClicked} />
        </div>
    }

    return <div>
        <OptionsDialog show={popupShown === "CREATE_OR_UPLOAD"}
            onDismiss={() => { setPopupShown("NONE") }}
            options={[
                {
                    label: "📁 Crear carpeta",
                    onClick: () => { setPopupShown("CREATE_FOLDER") },
                },
                {
                    label: "📄 Subir documentos",
                    onClick: () => { setPopupShown("UPLOAD_DOCUMENTS") },
                },
            ]}/>
        <CreateFolderDialog show={popupShown === "CREATE_FOLDER"}
            parentFolderStringPath={getStringPathForFolderIdsPath(currentFolderIdsPath, getTree())}
            parentFolderIdsPath={currentFolderIdsPath}
            onDismiss={() => { setPopupShown("NONE") }}
            onSuccess={onFolderOrDocumentsChanged}
            onFail={(errorMessage) => { setFeedback({ type: "error", message: errorMessage }); }} />
        <UploadDocumentsDialog show={popupShown === "UPLOAD_DOCUMENTS"}
            parentFolderStringPath={getStringPathForFolderIdsPath(currentFolderIdsPath, getTree())}
            parentFolderIdsPath={currentFolderIdsPath}
            onDismiss={() => { setPopupShown("NONE") }}
            onSuccess={onFolderOrDocumentsChanged}
            onFail={(errorMessage) => { setFeedback({ type: "error", message: errorMessage }); }} />
        <FilesBrowser filesTree={getTree()}
            selectedFolderIdsPath={currentFolderIdsPath}
            setSelectedFolderIdsPath={setCurrentFolderIdsPath}
            firstTabView={firstTabView()}
            showContextMenu={selectedRoot === "MY_FILES"}
            showAuthor={selectedRoot === "SHARED_WITH_ME"}
            canClickDocuments={true}
            onMoveDeleteSuccess={onMoveDeleteSuccess}
            onMoveDeleteFail={(errorMessage) => { setFeedback({ type: "error", message: errorMessage }); }} />
        <div className="card floatingCardAddNew" onClick={() => { setPopupShown("CREATE_OR_UPLOAD") }}>➕ Nuevo</div>
    </div>
}

export default FilesBody;