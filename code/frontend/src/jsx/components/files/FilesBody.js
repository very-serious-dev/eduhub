import { useState } from "react";
import TabbedActivity from "../common/TabbedActivity";
import FolderElement from "./FolderElement";
import DocumentElement from "./DocumentElement";

const FilesBody = (props) => {
    const [selectedFolderIndexPath, setSelectedFolderIndexPath] = useState([2, 0]);

    const tabsForSelectedPath = () => {
        const rootTabContent = { view: [] }
        props.tree.forEach(rootFolder => { rootTabContent.view.push(<FolderElement name={rootFolder.name} />) })
        const tabs = [rootTabContent];
        let subTreeBeingWalked = props.tree;
        for (let folderIdx of selectedFolderIndexPath) {
            const newTab = { view: [] }
            subTreeBeingWalked[folderIdx].children.forEach(child => {
                if (child.type === "folder") {
                    newTab.view.push(<FolderElement name={child.name} />);
                } else if (child.type === "document") {
                    newTab.view.push(<DocumentElement name={child.name} />);
                }
            });
            subTreeBeingWalked = subTreeBeingWalked[folderIdx].children;
            tabs.push(newTab);
        }
        return tabs;
    }

    return <TabbedActivity tabs={tabsForSelectedPath()}
        tabContentWidthPercentage={33}
        showTitles={false} />
}

export default FilesBody;