import { useContext } from "react";
import { getElementsCount } from "../../../util/FilesBrowserContainerUtil";
import { pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const SharedFilesFirstTabContent = (props) => {
    const theme = useContext(ThemeContext);

    const sharedFilesCount = getElementsCount(props.sharedFilesTree);

    return <div className={`filesFirstTabElement pointable ${pointableSecondary(theme)} ${props.isSelected ? primary(theme) : "filesElementUnselected"}`}
        onClick={() => { props.onRootClicked("SHARED_WITH_ME") }}>
        <div className="filesFirstTabTitle">📎 Compartido contigo</div>
        <div className="filesFirstTabSubtitle">{sharedFilesCount.nDocuments} documentos y {sharedFilesCount.nFolders} carpetas</div>
    </div>
}

export default SharedFilesFirstTabContent;