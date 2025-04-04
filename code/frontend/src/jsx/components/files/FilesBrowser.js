import { useState } from "react";
import TabbedActivity from "../common/TabbedActivity";
import FolderElement from "./FolderElement";
import DocumentElement from "./DocumentElement";
import FilesFirstTabContent from "./FilesFirstTabContent";
import FilesEmptyFolderTabContent from "./FilesEmptyFolderTabContent";

const FilesBrowser = (props) => {
    const [selectedRoot, setSelectedRoot] = useState("MY_FILES"); // MY_FILES, SHARED_WITH_ME

    const onFolderSelected = (folderId, level) => {
        const newSelectedFolderIdsPath = props.selectedFolderIdsPath.slice(0, level - 1).concat(folderId);
        props.setSelectedFolderIdsPath(newSelectedFolderIdsPath);
    }

    const onRootSelected = (root) => {
        setSelectedRoot(root);
        props.setSelectedFolderIdsPath([]);
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

    const getTree = () => {
        if (selectedRoot === "MY_FILES") {
            return props.myFilesTree;
        } else if (selectedRoot === "SHARED_WITH_ME") {
            return undefined; // TODO: Tree shared with me?
        }
    }

    const baseTabForCurrentTree = () => {
        return {
            view: <FilesFirstTabContent selectedRoot={selectedRoot}
                onRootClicked={onRootSelected}
                tree={props.myFilesTree} />
        }
    }

    const tabsForCurrentTreeAndSelectedFolder = () => {
        const tabs = [];
        let level = 1;
        let levelBeingWalked = getTree();
        let levelBeingWalkedSelectedFolderId;
        do {
            const newTab = { view: [] }
            levelBeingWalkedSelectedFolderId = props.selectedFolderIdsPath.length > level - 1 ? props.selectedFolderIdsPath[level - 1] : undefined;
            if (levelBeingWalked.length === 0) {
                newTab.view = <FilesEmptyFolderTabContent />
            } else {
                [...levelBeingWalked].sort(orderingCriteria).forEach(element => {
                    if (element.type === "folder") {
                        newTab.view.push(
                            <FolderElement folder={element}
                                level={level}
                                onFolderClicked={onFolderSelected}
                                selected={levelBeingWalkedSelectedFolderId !== undefined ? levelBeingWalkedSelectedFolderId === element.id : false}
                                showContextMenu={props.showContextMenus}
                                myFilesTree={props.myFilesTree}
                                onMoveDeleteSuccess={props.onMoveDeleteSuccess}
                                onMoveDeleteFail={props.onMoveDeleteFail} />);
                    } else if (element.type === "document") {
                        newTab.view.push(
                            <DocumentElement document={element}
                                mimeType={element.mime_type}
                                size={element.size}
                                showContextMenu={props.showContextMenus}
                                isClickable={props.canClickFiles}
                                myFilesTree={props.myFilesTree}
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
        return [baseTabForCurrentTree(), ...tabsForCurrentTreeAndSelectedFolder()];
    }

    return <TabbedActivity tabs={tabsForSelectedPath()}
        tabContentWidthPercentage={33}
        showTitles={false}
        forcedTabSelectedIndex={Math.max(0, props.selectedFolderIdsPath.length - 1)}
        emptyFooter={props.showContextMenus === true} />
}

export default FilesBrowser;