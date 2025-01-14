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
                return 1;
            }
        } else if (a.type === "document") {
            if (b.type === "folder") {
                return -1;
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

    const baseTabsForCurrentTree = () => {
        /* The first 2 tabs for the file browser */
        const firstTabContent = {
            view: <FilesFirstTabContent selectedRoot={selectedRoot}
                onRootClicked={onRootSelected} />
        }
        const rootFoldersTabContent = { view: [] }
        getTree().sort(orderingCriteria).forEach(rootFolder => {
            rootFoldersTabContent.view.push(
                <FolderElement folder={rootFolder}
                    level={1}
                    onFolderClicked={onFolderSelected}
                    selected={props.selectedFolderIdsPath.length > 0 ? props.selectedFolderIdsPath[0] === rootFolder.id : false}
                    showContextMenu={props.showContextMenus}
                    myFilesTree={props.myFilesTree}
                    onMoveDeleteSuccess={props.onMoveDeleteSuccess}
                    onMoveDeleteFail={props.onMoveDeleteFail} />)
        })
        return [firstTabContent, rootFoldersTabContent];
    }

    const additionalTabsForCurrentTreeAndSelectedFolder = () => {
        /* Sub-expanded tabs (level 2+) according to selected folder */
        const tabs = [];
        let level = 2;
        let subTreeBeingWalked = getTree();
        for (let folderId of props.selectedFolderIdsPath) {
            const newTab = { view: [] }
            const folderBeingWalked = subTreeBeingWalked.find(f => f.id === folderId);
            if (folderBeingWalked.children.length === 0) {
                newTab.view = <FilesEmptyFolderTabContent />
            } else {
                [...folderBeingWalked.children].sort(orderingCriteria).forEach(child => {
                    if (child.type === "folder") {
                        newTab.view.push(
                            <FolderElement folder={child}
                                level={level}
                                onFolderClicked={onFolderSelected}
                                selected={props.selectedFolderIdsPath[level - 1] === child.id}
                                showContextMenu={props.showContextMenus}
                                myFilesTree={props.myFilesTree}
                                onMoveDeleteSuccess={props.onMoveDeleteSuccess}
                                onMoveDeleteFail={props.onMoveDeleteFail} />);
                    } else if (child.type === "document") {
                        newTab.view.push(
                            <DocumentElement document={child}
                                mimeType={child.mime_type}
                                size={child.size}
                                showContextMenu={props.showContextMenus}
                                isClickable={props.canClickFiles}
                                myFilesTree={props.myFilesTree}
                                onMoveDeleteSuccess={props.onMoveDeleteSuccess}
                                onMoveDeleteFail={props.onMoveDeleteFail} />);
                    }
                });
                subTreeBeingWalked = folderBeingWalked.children;
                level += 1;
            }
            tabs.push(newTab);
        }
        return tabs;
    }

    const tabsForSelectedPath = () => {
        return [...baseTabsForCurrentTree(), ...additionalTabsForCurrentTreeAndSelectedFolder()];
    }

    return <TabbedActivity tabs={tabsForSelectedPath()}
        tabContentWidthPercentage={33}
        showTitles={false}
        forcedTabSelectedIndex={Math.max(0, props.selectedFolderIdsPath.length - 1)}
        emptyFooter={props.showContextMenus === true} />
}

export default FilesBrowser;