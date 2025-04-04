import GetStorageFromCookie from "../../../client/GetStorageFromCookie";
import { getElementsCount } from "../../../util/FilesBrowserContainerUtil";

const MyFilesFirstTabContent = (props) => {
    const myFilesCount = getElementsCount(props.myFilesTree);
    const max_storage = GetStorageFromCookie();
    const Gb = 1024 * 1024 * 1024;

    return <div className={`filesFirstTabElement myFilesElementContainerHoverable ${props.isSelected ? "filesElementSelected" : "filesElementUnselected"}`}
        onClick={() => { props.onRootClicked("MY_FILES") }}>
        <div className="filesFirstTabTitle">🖥️ Tu unidad</div>
        <div className="filesFirstTabSubtitle">{Math.round(myFilesCount.nBytes / max_storage.bytes).toFixed(2)}% usado de {max_storage.bytes / Gb}GB</div>
        <div className="filesFirstTabSubtitle">{myFilesCount.nDocuments}/{max_storage.documents} documentos</div>
        <div className="filesFirstTabSubtitle">{myFilesCount.nFolders}/{max_storage.folders} carpetas</div>
    </div>
}

export default MyFilesFirstTabContent;