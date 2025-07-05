import { DOCU_SERVER } from "../../../client/Servers";
import { footNoteDateAuthor, iconImgSrc, sizeToHumanReadable } from "../../../util/Formatter";
import FilesElementContextMenuButton from "./FilesElementContextMenuButton";

const DocumentElement = (props) => {

    const onClickFile = () => {
        if (props.isClickable) {
            window.open(`${DOCU_SERVER}/api/v1/documents/${props.document.identifier}`, "_blank");
        }
    }

    const shouldShowContextMenu = () => {
        return props.showContextMenu;
    }

    return <div className={`myFilesElementContainer ${props.isClickable ? " myFilesElementContainerHoverable pointable" : ""}`} onClick={onClickFile}>
        {shouldShowContextMenu() && <FilesElementContextMenuButton document={props.document}
            filesTree={props.filesTree}
            onMoveDeleteSuccess={props.onMoveDeleteSuccess}
            onMoveDeleteFail={props.onMoveDeleteFail} />}
        <div className="myFilesElementTitleContainer">
            <img className="myFilesElementIcon" src={iconImgSrc(props.mimeType)}></img>
            <div className="myFilesElementName">{props.document.name}</div>
        </div>
        {props.document.is_protected && <div className="myFilesElementSpecialText">🚫 Protegido</div>}
        <div className="myFilesElementSize">{sizeToHumanReadable(props.size)}</div>
        <div className="myFilesElementAuthorDate">{`${footNoteDateAuthor(props.document.created_at, props.showAuthor ? props.document.author : null)}`}</div>
    </div>
}

export default DocumentElement;