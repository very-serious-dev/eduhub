import { useContext } from "react";
import { footNoteDateAuthor } from "../../../util/Formatter";
import FilesElementContextMenuButton from "./FilesElementContextMenuButton";
import { ThemeContext } from "../../main/GlobalContainer";
import { pointableSecondary, primary } from "../../../util/Themes";

const FolderElement = (props) => {
    const theme = useContext(ThemeContext);

    const shouldShowContextMenu = () => {
        return props.showContextMenu;
    }

    return <div className={`myFilesElementContainer pointable ${pointableSecondary(theme)} ${props.selected ? primary(theme) : "filesElementUnselected"}`}
        onClick={() => { props.onFolderClicked(props.folder.id, props.level) }}>
        {shouldShowContextMenu() && <FilesElementContextMenuButton folder={props.folder}
            filesTree={props.filesTree}
            onMoveDeleteSuccess={props.onMoveDeleteSuccess}
            onMoveDeleteFail={props.onMoveDeleteFail} />}
        <div className="myFilesElementTitleContainer">
            <img className="myFilesElementIcon" src="/small/icon_folder.png"></img>
            <div className="myFilesElementName">{props.folder.name}</div>
        </div>
        {props.folder.isProtected && <div className="myFilesElementSpecialText">🔒 Contiene documentos protegidos</div>}
        <div className="myFilesElementAuthorDate">{`${footNoteDateAuthor(props.folder.created_at, props.showAuthor ? `👤 ${props.folder.author}` : null)}`}</div>
    </div>
}

export default FolderElement;