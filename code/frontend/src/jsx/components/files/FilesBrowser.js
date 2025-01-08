import { useState } from "react";
import TabbedActivity from "../common/TabbedActivity";
import FolderElement from "./FolderElement";
import DocumentElement from "./DocumentElement";
import FilesFirstTabContent from "./FilesFirstTabContent";
import FilesEmptyFolderTabContent from "./FilesEmptyFolderTabContent";

const FilesBrowser = (props) => {
    const [selectedRoot, setSelectedRoot] = useState("MY_FILES"); // MY_FILES, SHARED_WITH_ME
    const [selectedFolderIdsPath, setSelectedFolderIdsPath] = useState([]);

    const onFolderSelected = (folderId, level) => {
        const newSelectedFolderIdsPath = selectedFolderIdsPath.slice(0, level - 1).concat(folderId);
        setSelectedFolderIdsPath(newSelectedFolderIdsPath);
        invokeOnFolderSelectedDelegateIfNeeded(newSelectedFolderIdsPath);
    }

    const onRootSelected = (root) => {
        const newSelectedFolderIdsPath = []
        setSelectedFolderIdsPath(newSelectedFolderIdsPath);
        setSelectedRoot(root);
        invokeOnFolderSelectedDelegateIfNeeded(newSelectedFolderIdsPath);
    }

    const invokeOnFolderSelectedDelegateIfNeeded = (actualSelectedFolderIdsPath) => {
        if (props.onFolderSelected) {
            const selectedFolderId = actualSelectedFolderIdsPath.length > 0 ? actualSelectedFolderIdsPath.slice(-1) : null;
            const selectedFolderPath = getFullPathFromSelectedIds(actualSelectedFolderIdsPath);
            props.onFolderSelected(selectedFolderId, selectedFolderPath);
        }
    }

    const getFullPathFromSelectedIds = (actualSelectedFolderIdsPath) => {
        let path = "/";
        let subTreeBeingWalked = getTree();
        for (let folderId of actualSelectedFolderIdsPath) {
            const folderBeingWalked = subTreeBeingWalked.find(f => f.id === folderId);
            path += `${folderBeingWalked.name}/`;
            subTreeBeingWalked = folderBeingWalked.children;
        }
        return path;
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
                onRootClicked={onRootSelected}
                foldersCount={props.foldersCount}
                documentsCount={props.documentsCount} />
        }
        const rootFoldersTabContent = { view: [] }
        getTree().forEach(rootFolder => {
            rootFoldersTabContent.view.push(
                <FolderElement id={rootFolder.id}
                    name={rootFolder.name}
                    level={1}
                    onFolderClicked={onFolderSelected}
                    selected={selectedFolderIdsPath.length > 0 ? selectedFolderIdsPath[0] === rootFolder.id : false} />)
        })
        return [firstTabContent, rootFoldersTabContent];
    }

    const additionalTabsForCurrentTreeAndSelectedFolder = () => {
        /* Sub-expanded tabs (level 2+) according to selected folder */
        const tabs = [];
        let level = 2;
        let subTreeBeingWalked = getTree();
        for (let folderId of selectedFolderIdsPath) {
            const newTab = { view: [] }
            const folderBeingWalked = subTreeBeingWalked.find(f => f.id === folderId);
            if (folderBeingWalked.children.length === 0) {
                newTab.view = <FilesEmptyFolderTabContent />
            } else {
                [...folderBeingWalked.children].sort(orderingCriteria).forEach(child => {
                    if (child.type === "folder") {
                        newTab.view.push(
                            <FolderElement id={child.id}
                                name={child.name}
                                level={level}
                                onFolderClicked={onFolderSelected}
                                selected={selectedFolderIdsPath[level - 1] === child.id} />);
                    } else if (child.type === "document") {
                        newTab.view.push(
                            <DocumentElement identifier={child.identifier}
                                name={child.name}
                                mimeType={child.mime_type}
                                size={child.size}
                                isClickable={props.canClickFiles} />);
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
        forcedTabSelectedIndex={Math.max(0, selectedFolderIdsPath.length - 1)} />
}

export default FilesBrowser;