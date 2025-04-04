import { getElementsCount } from "../../../util/FilesBrowserContainerUtil";

const SharedFilesFirstTabContent = (props) => {
    const sharedFilesCount = getElementsCount(props.sharedFilesTree);

    return <div className={`filesFirstTabElement myFilesElementContainerHoverable ${props.isSelected ? "filesElementSelected" : "filesElementUnselected"}`}
        onClick={() => { props.onRootClicked("SHARED_WITH_ME") }}>
        <div className="filesFirstTabTitle">📎 Compartido contigo</div>
        <div className="filesFirstTabSubtitle">{sharedFilesCount.nDocuments} documentos y {sharedFilesCount.nFolders} carpetas</div>
    </div>
}

export default SharedFilesFirstTabContent;