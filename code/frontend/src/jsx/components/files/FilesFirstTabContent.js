import GetStorageFromCookie from "../../../client/GetStorageFromCookie";
import { getElementsCount } from "../../../util/FilesBrowserContainerUtil";

const FilesFirstTabContent = (props) => {
    const myFilesCount = getElementsCount(props.myFilesTree);
    const max_storage = GetStorageFromCookie();
    const Gb = 1024 * 1024 * 1024;
    let sharedFilesCount;
    if(props.showSharedFiles) {
        sharedFilesCount = getElementsCount(props.sharedFilesTree);
    } 

    return <div>
        <div className={`filesFirstTabElement myFilesElementContainerHoverable ${props.selectedRoot === "MY_FILES" ? "filesElementSelected" : "filesElementUnselected"}`}
            onClick={() => { props.onRootClicked("MY_FILES") }}>
            <div className="filesFirstTabTitle">🖥️ Tu unidad</div>
            <div className="filesFirstTabSubtitle">{Math.round(myFilesCount.nBytes / max_storage.bytes).toFixed(2)}% usado de {max_storage.bytes / Gb}GB</div>
            <div className="filesFirstTabSubtitle">{myFilesCount.nDocuments}/{max_storage.documents} documentos</div>
            <div className="filesFirstTabSubtitle">{myFilesCount.nFolders}/{max_storage.folders} carpetas</div>
        </div>
        {props.showSharedFiles && <div className={`filesFirstTabElement myFilesElementContainerHoverable ${props.selectedRoot === "SHARED_WITH_ME" ? "filesElementSelected" : "filesElementUnselected"}`}
            onClick={() => { props.onRootClicked("SHARED_WITH_ME") }}>
            <div className="filesFirstTabTitle">📎 Compartido contigo</div>
            <div className="filesFirstTabSubtitle">{sharedFilesCount.nDocuments} documentos y {sharedFilesCount.nFolders} carpetas</div>
        </div>}
    </div>
}

export default FilesFirstTabContent;