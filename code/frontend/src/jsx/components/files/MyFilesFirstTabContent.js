import { useContext } from "react";
import { GetSessionUserMaxStorage } from "../../../client/ClientCache";
import { getElementsCount } from "../../../util/FilesBrowserContainerUtil";
import { ThemeContext } from "../../main/GlobalContainer";
import { pointableSecondary, secondary } from "../../../util/Themes";

const MyFilesFirstTabContent = (props) => {
    const myFilesCount = getElementsCount(props.myFilesTree);
    const MAX_STORAGE = GetSessionUserMaxStorage();
    const Gb = 1024 * 1024 * 1024;
    const theme = useContext(ThemeContext);

    return <div className={`filesFirstTabElement pointable ${pointableSecondary(theme)} ${props.isSelected ? secondary(theme) : "filesElementUnselected"}`}
        onClick={() => { props.onRootClicked("MY_FILES") }}>
        <div className="filesFirstTabTitle">🖥️ Tu unidad</div>
        {MAX_STORAGE.bytes && <div className="filesFirstTabSubtitle">{Math.round(myFilesCount.nBytes / MAX_STORAGE.bytes).toFixed(2)}% usado de {MAX_STORAGE.bytes / Gb}GB</div>}
        {MAX_STORAGE.documents && <div className="filesFirstTabSubtitle">{myFilesCount.nDocuments}/{MAX_STORAGE.documents} documentos</div>}
        {MAX_STORAGE.folders && <div className="filesFirstTabSubtitle">{myFilesCount.nFolders}/{MAX_STORAGE.folders} carpetas</div>}
    </div>
}

export default MyFilesFirstTabContent;