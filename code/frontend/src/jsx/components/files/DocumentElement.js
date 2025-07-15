import { useContext } from "react";
import { documentIconImgSrc, footNoteDateAuthor, sizeToHumanReadable } from "../../../util/Formatter";
import FilesElementContextMenuButton from "./FilesElementContextMenuButton";
import { ThemeContext } from "../../main/GlobalContainer";
import { pointableSecondary } from "../../../util/Themes";

const DocumentElement = (props) => {
    const theme = useContext(ThemeContext);

    const onClickDocument = (document) => {
        if (props.onClickDocument) {
            props.onClickDocument(document)
        }
    }

    const shouldShowContextMenu = () => {
        return props.showContextMenu;
    }

    return <div className={`myFilesElementContainer filesElementUnselected ${props.onClickFile !== null ? ` pointable ${pointableSecondary(theme)}` : ""}`} onClick={() => { onClickDocument(props.document) }}>
        {shouldShowContextMenu() && <FilesElementContextMenuButton document={props.document}
            filesTree={props.filesTree}
            onMoveDeleteSuccess={props.onMoveDeleteSuccess}
            onMoveDeleteFail={props.onMoveDeleteFail} />}
        <div className="myFilesElementTitleContainer">
            <img className="myFilesElementIcon" src={documentIconImgSrc(props.mimeType)}></img>
            <div className="myFilesElementName">{props.document.name}</div>
        </div>
        {props.document.is_protected && <div className="myFilesElementSpecialText">🚫 Protegido</div>}
        <div className="myFilesElementSize">{sizeToHumanReadable(props.size)}</div>
        <div className="myFilesElementAuthorDate">{`${footNoteDateAuthor(props.document.created_at, props.showAuthor ? `👤 ${props.document.author}` : null)}`}</div>
    </div>
}

export default DocumentElement;