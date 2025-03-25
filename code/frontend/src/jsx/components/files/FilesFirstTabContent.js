import GetStorageFromCookie from "../../../client/GetStorageFromCookie";
import { getElementsCount } from "../../../util/FilesBrowserContainerUtil";

const FilesFirstTabContent = (props) => {
    const filesCount = getElementsCount(props.tree);
    const max_storage = GetStorageFromCookie();
    const Gb = 1024 * 1024 * 1024;

    return <div>
        <div className={`filesFirstTabElement myFilesElementContainerHoverable ${props.selectedRoot === "MY_FILES" ? "filesElementSelected" : "filesElementUnselected"}`}
            onClick={() => { props.onRootClicked("MY_FILES") }}>
            <div className="filesFirstTabTitle">🖥️ Tu unidad</div>
            <div className="filesFirstTabSubtitle">{Math.round(filesCount.nBytes / max_storage.bytes).toFixed(2)}% usado de {max_storage.bytes / Gb}GB</div>
            <div className="filesFirstTabSubtitle">{filesCount.nDocuments}/{max_storage.documents} documentos</div>
            <div className="filesFirstTabSubtitle">{filesCount.nFolders}/{max_storage.folders} carpetas</div>
        </div>
    </div>
}

export default FilesFirstTabContent;