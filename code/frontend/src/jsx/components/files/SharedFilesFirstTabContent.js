import { useContext } from "react";
import { getElementsCount } from "../../../util/FilesBrowserContainerUtil";
import { pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const SharedFilesFirstTabContent = (props) => {
    const theme = useContext(ThemeContext);

    const sharedFilesCount = getElementsCount(props.sharedFilesTree);

    const appropriatelyCollapseZeroToThreeElementsInText = (elementsArray) => {
        let text = "";
        if (elementsArray.length === 1) {
            text = elementsArray[0];
        } else if (elementsArray.length === 2) {
            text = `${elementsArray[0]} y ${elementsArray[1]}`;
        } else if (elementsArray.length === 3) {
            text = `${elementsArray[0]}, ${elementsArray[1]} y ${elementsArray[2]}`;
        }
        return text;
    }

    const sharedFilesText = []
    if (sharedFilesCount.nDocuments > 0) {
        sharedFilesText.push(`${sharedFilesCount.nDocuments} ${sharedFilesCount.nDocuments === 1 ? "documento" : "documentos"}`);
    }
    if (sharedFilesCount.nQuestionnaires > 0) {
        sharedFilesText.push(`${sharedFilesCount.nQuestionnaires} ${sharedFilesCount.nQuestionnaires === 1 ? "formulario" : "formularios"}`);
    }
    if (sharedFilesCount.nFolders > 0) {
        sharedFilesText.push(`${sharedFilesCount.nFolders} ${sharedFilesCount.nFolders === 1 ? "carpeta" : "carpetas"}`);
    }

    return <div className={`filesFirstTabElement pointable ${pointableSecondary(theme)} ${props.isSelected ? primary(theme) : "filesElementUnselected"}`}
        onClick={() => { props.onRootClicked("SHARED_WITH_ME") }}>
        <div className="filesFirstTabTitle">📎 Compartido contigo</div>
        <div className="filesFirstTabSubtitle">{appropriatelyCollapseZeroToThreeElementsInText(sharedFilesText)}</div>
    </div>
}

export default SharedFilesFirstTabContent;