import { useContext, useState } from "react";
import { FeedbackContext } from "../../main/GlobalContainer";
import FilesBrowser from "./FilesBrowser";
import MyFilesFirstTabContent from "./MyFilesFirstTabContent";
import SharedFilesFirstTabContent from "./SharedFilesFirstTabContent";
import { DOCU_SERVER } from "../../../client/Servers";
import { useNavigate } from "react-router";

const FilesBody = (props) => {
    const [currentFolderIdsPath, setCurrentFolderIdsPath] = useState([]);
    const [selectedRoot, setSelectedRoot] = useState("MY_FILES"); // MY_FILES, SHARED_WITH_ME
    const navigate = useNavigate();
    const setFeedback = useContext(FeedbackContext);

    const onRootClicked = (root) => {
        setSelectedRoot(root);
        setCurrentFolderIdsPath([]);
    }

    const onCreateMoveDeleteSuccess = (result) => {
        fallbackToPreviousFolderIfCurrentWasMovedOrDeleted(result, currentFolderIdsPath, setCurrentFolderIdsPath);
        setFeedback({ type: "success", message: "Completado con éxito" });
        props.onMyFilesChanged(result);
    }

    const fallbackToPreviousFolderIfCurrentWasMovedOrDeleted = (moveOrDeleteResult) => {
        if (moveOrDeleteResult.operation === "folder_changed") {
            const folderLevel = currentFolderIdsPath.indexOf(moveOrDeleteResult.folder.id);
            if (folderLevel !== -1) {
                setCurrentFolderIdsPath(currentFolderIdsPath.slice(0, folderLevel));
            }
        } else if (moveOrDeleteResult.operation === "files_deleted") {
            const deletedFolderId = moveOrDeleteResult.ancestor_folder_id
            const folderLevelToFallback = currentFolderIdsPath.indexOf(deletedFolderId)
            if (folderLevelToFallback !== -1) {
                setCurrentFolderIdsPath(currentFolderIdsPath.slice(0, folderLevelToFallback));
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

    const openDocumentOrQuestionnaire = (element) => {
        if (element.type === "document") {
            window.open(`${DOCU_SERVER}/api/v1/documents/${element.identifier}`, "_blank");
        }
        if (element.type === "questionnaire") {
            navigate(`/forms/${element.id}`);
        }
    }

    return <FilesBrowser filesTree={getTree()}
        selectedFolderIdsPath={currentFolderIdsPath}
        setSelectedFolderIdsPath={setCurrentFolderIdsPath}
        firstTabView={firstTabView()}
        showContextMenu={selectedRoot === "MY_FILES"}
        showUploadOrCreateFolder={selectedRoot === "MY_FILES"}
        showAuthor={selectedRoot === "SHARED_WITH_ME"}
        onDocumentOrQuestionnaireSelected={openDocumentOrQuestionnaire}
        onCreateMoveDeleteSuccess={onCreateMoveDeleteSuccess}
        onCreateMoveDeleteFail={(errorMessage) => { setFeedback({ type: "error", message: errorMessage }); }} />

}

export default FilesBody;