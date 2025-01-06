import { useState } from "react";
import TabbedActivity from "../common/TabbedActivity";
import FolderElement from "./FolderElement";
import DocumentElement from "./DocumentElement";
import FilesFirstTabContent from "./FilesFirstTabContent";

const FilesBody = (props) => {
    const [selectedFolderIdsPath, setSelectedFolderIdsPath] = useState([]);

    const onFolderSelected = (folderId, level) => {
        setSelectedFolderIdsPath(oldSelectedIdsPath => {
            const selectedIdsPathUpToLevelSelected = oldSelectedIdsPath.slice(0, level-1);
            return selectedIdsPathUpToLevelSelected.concat(folderId);
        });
    }

    const tabsForSelectedPath = () => {
        const firstTabContent = { view: <FilesFirstTabContent />}
        const rootFoldersTabContent = { view: [] }
        props.tree.forEach(rootFolder => { rootFoldersTabContent.view.push(<FolderElement id={rootFolder.id} name={rootFolder.name} level={1} onFolderClicked={onFolderSelected}/>) })
        const tabs = [firstTabContent, rootFoldersTabContent];
        let subTreeBeingWalked = props.tree;
        let level = 2;
        for (let folderId of selectedFolderIdsPath) {
            const newTab = { view: [] }
            const folderBeingWalked = subTreeBeingWalked.find(f => f.id === folderId)
            folderBeingWalked.children.forEach(child => {
                if (child.type === "folder") {
                    newTab.view.push(<FolderElement id={child.id} name={child.name} level={level} onFolderClicked={onFolderSelected}/>);
                } else if (child.type === "document") {
                    newTab.view.push(<DocumentElement name={child.name} />);
                }
            });
            subTreeBeingWalked = folderBeingWalked.children;
            level += 1;
            tabs.push(newTab);
        }
        return tabs;
    }

    return <TabbedActivity tabs={tabsForSelectedPath()}
        tabContentWidthPercentage={33}
        showTitles={false}
        forcedTabSelectedIndex={Math.max(0, selectedFolderIdsPath.length - 1)} />
}

export default FilesBody;