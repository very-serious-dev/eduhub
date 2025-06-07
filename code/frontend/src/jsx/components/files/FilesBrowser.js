import TabbedActivity from "../common/TabbedActivity";
import FolderElement from "./FolderElement";
import DocumentElement from "./DocumentElement";
import FilesEmptyFolderTabContent from "./FilesEmptyFolderTabContent";
import { isMobile } from "../../../util/Responsive";

const FilesBrowser = (props) => {

    const onFolderSelected = (folderId, level) => {
        const newSelectedFolderIdsPath = props.selectedFolderIdsPath.slice(0, level - 1).concat(folderId);
        props.setSelectedFolderIdsPath(newSelectedFolderIdsPath);
    }

    const compareByName = (a, b) => {
        return a.name.localeCompare(b.name);
    }

    const orderingCriteria = (a, b) => {
        if (a.type === "folder") {
            if (b.type === "folder") {
                return compareByName(a, b);
            } else if (b.type === "document") {
                return -1;
            }
        } else if (a.type === "document") {
            if (b.type === "folder") {
                return 1;
            } else if (b.type === "document") {
                return compareByName(a, b);
            }
        }
    }

    const tabsForCurrentTreeAndSelectedFolder = () => {
        const tabs = [];
        let level = 1;
        let levelBeingWalked = props.filesTree;
        let levelBeingWalkedSelectedFolderId;
        do {
            const newTab = { view: [] }
            levelBeingWalkedSelectedFolderId = props.selectedFolderIdsPath.length > level - 1 ? props.selectedFolderIdsPath[level - 1] : undefined;
            if (levelBeingWalked.length === 0) {
                newTab.view = <FilesEmptyFolderTabContent isEmptyRoot={level === 1} />
            } else {
                [...levelBeingWalked].sort(orderingCriteria).forEach(element => {
                    if (element.type === "folder") {
                        newTab.view.push(
                            <FolderElement folder={element}
                                level={level}
                                onFolderClicked={onFolderSelected}
                                selected={levelBeingWalkedSelectedFolderId !== undefined ? levelBeingWalkedSelectedFolderId === element.id : false}
                                showContextMenu={props.showContextMenu}
                                showAuthor={props.showAuthor}
                                filesTree={props.filesTree}
                                onMoveDeleteSuccess={props.onMoveDeleteSuccess}
                                onMoveDeleteFail={props.onMoveDeleteFail} />);
                    } else if (element.type === "document") {
                        newTab.view.push(
                            <DocumentElement document={element}
                                mimeType={element.mime_type}
                                size={element.size}
                                showContextMenu={props.showContextMenu}
                                showAuthor={props.showAuthor}
                                isClickable={props.canClickDocuments}
                                filesTree={props.filesTree}
                                onMoveDeleteSuccess={props.onMoveDeleteSuccess}
                                onMoveDeleteFail={props.onMoveDeleteFail} />);
                    }
                });
            }
            if (levelBeingWalkedSelectedFolderId !== undefined) {
                level += 1;
                levelBeingWalked = levelBeingWalked.find(e => e.id === levelBeingWalkedSelectedFolderId).children
            }
            tabs.push(newTab);
        } while (levelBeingWalkedSelectedFolderId !== undefined);
        return tabs;
    }

    const tabsForSelectedPath = () => {
        return [{ view: props.firstTabView }, ...tabsForCurrentTreeAndSelectedFolder()];
    }

    return <>
        {isMobile() && <div className="card mobileFileBrowserGoBack" onClick={() => { props.setSelectedFolderIdsPath(x => x.slice(0, -1)); }}>← Subir</div>}
        <TabbedActivity tabs={tabsForSelectedPath()}
            tabContentWidthPercentage={isMobile() ? 50: 33}
            showTitles={false}
            forcedTabSelectedIndex={Math.max(0, props.selectedFolderIdsPath.length - (isMobile() ? 0 : 1))}
            emptyFooter={props.browserMode === "MAIN_SCREEN"} /></>
}

export default FilesBrowser;