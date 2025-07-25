import TabbedActivity from "../common/TabbedActivity";
import FolderElement from "./FolderElement";
import DocumentElement from "./DocumentElement";
import FilesEmptyFolderTabContent from "./FilesEmptyFolderTabContent";
import { useIsMobile } from "../../../util/Responsive";
import FilesBrowserTabWithUpload from "./FilesBrowserTabWithUpload";
import QuestionnaireElement from "./QuestionnaireElement";

const FilesBrowser = (props) => {
    const isMobile = useIsMobile();

    const onFolderSelected = (folderId, level) => {
        const newSelectedFolderIdsPath = props.selectedFolderIdsPath.slice(0, level - 1).concat(folderId);
        props.setSelectedFolderIdsPath(newSelectedFolderIdsPath);
    }

    const orderingCriteria = (a, b) => {
        if (a.type === "folder") {
            if (b.type === "folder") {
                return a.name.localeCompare(b.name);
            } else if (b.type === "document" || b.type === "questionnaire") {
                return -1;
            }
        } else if (a.type === "document") {
            if (b.type === "folder") {
                return 1;
            } else if (b.type === "document") {
                return a.name.localeCompare(b.name);
            } else if (b.type === "questionnaire") {
                return a.name.localeCompare(b.title);
            }
        } else if (a.type === "questionnaire") {
            if (b.type === "folder") {
                return 1;
            } else if (b.type === "document") {
                return a.title.localeCompare(b.name);
            } else if (b.type === "questionnaire") {
                return a.title.localeCompare(b.title);
            }
        }
    }

    const tabsForCurrentTreeAndSelectedFolder = () => {
        const tabs = [];
        let level = 1;
        let levelBeingWalked = props.filesTree;
        let levelBeingWalkedParentFolderId = null;
        let levelBeingWalkedSelectedFolderId;
        do {
            const newTabElements = []
            levelBeingWalkedSelectedFolderId = props.selectedFolderIdsPath.length > level - 1 ? props.selectedFolderIdsPath[level - 1] : undefined;
            if (levelBeingWalked.length === 0) {
                newTabElements.push(<FilesEmptyFolderTabContent isEmptyRoot={level === 1} />)
            } else {
                [...levelBeingWalked].sort(orderingCriteria).forEach(element => {
                    if (element.type === "folder") {
                        newTabElements.push(
                            <FolderElement folder={element}
                                level={level}
                                onFolderClicked={onFolderSelected}
                                selected={levelBeingWalkedSelectedFolderId !== undefined ? levelBeingWalkedSelectedFolderId === element.id : false}
                                showContextMenu={props.showContextMenu}
                                showAuthor={props.showAuthor}
                                filesTree={props.filesTree}
                                onMoveDeleteSuccess={props.onCreateMoveDeleteSuccess}
                                onMoveDeleteFail={props.onCreateMoveDeleteFail} />);
                    } else if (element.type === "document") {
                        newTabElements.push(
                            <DocumentElement document={element}
                                mimeType={element.mime_type}
                                size={element.size}
                                showContextMenu={props.showContextMenu}
                                showAuthor={props.showAuthor}
                                filesTree={props.filesTree}
                                onClick={props.onDocumentOrQuestionnaireSelected}
                                onMoveDeleteSuccess={props.onCreateMoveDeleteSuccess}
                                onMoveDeleteFail={props.onCreateMoveDeleteFail} />);
                    } else if (element.type === "questionnaire") {
                        newTabElements.push(
                            <QuestionnaireElement questionnaire={element}
                                showContextMenu={props.showContextMenu}
                                showAuthor={props.showAuthor}
                                filesTree={props.filesTree}
                                onClick={props.onDocumentOrQuestionnaireSelected}
                                onMoveDeleteSuccess={props.onCreateMoveDeleteSuccess}
                                onMoveDeleteFail={props.onCreateMoveDeleteFail} />);
                    }
                });
            }
            if (props.showUploadOrCreateFolder) {
                tabs.push({
                    view: <FilesBrowserTabWithUpload
                        elements={newTabElements}
                        parentFolderId={levelBeingWalkedParentFolderId}
                        onCreateEditSuccess={props.onCreateMoveDeleteSuccess}
                        onCreateFail={props.onCreateMoveDeleteFail} />
                });
            } else {
                tabs.push({ view: newTabElements });
            }
            if (levelBeingWalkedSelectedFolderId !== undefined) {
                level += 1;
                levelBeingWalked = levelBeingWalked.find(e => e.id === levelBeingWalkedSelectedFolderId).children
                levelBeingWalkedParentFolderId = levelBeingWalkedSelectedFolderId
            }
        } while (levelBeingWalkedSelectedFolderId !== undefined);
        return tabs;
    }

    const tabsForSelectedPath = () => {
        return [{ view: props.firstTabView }, ...tabsForCurrentTreeAndSelectedFolder()];
    }

    return <>
        {isMobile && <div className="card mobileFileBrowserGoBack" onClick={() => { props.setSelectedFolderIdsPath(x => x.slice(0, -1)); }}>← Subir</div>}
        <TabbedActivity tabs={tabsForSelectedPath()}
            tabContentWidthPercentage={isMobile ? 50 : 33}
            showTitles={false}
            forcedTabSelectedIndex={Math.max(0, props.selectedFolderIdsPath.length - (isMobile ? 0 : 1))}
            emptyFooter={true} /></>
}

export default FilesBrowser;