import DocuURL from "../../../client/DocuURL";
import { iconImgSrc, sizeToHumanReadable } from "../../../util/Formatter";
import FilesElementContextMenuButton from "./FilesElementContextMenuButton";

const DocumentElement = (props) => {

    const onClickFile = () => {
        if (props.isClickable) {
            window.open(`${DocuURL}/api/v1/documents/${props.document.identifier}`, "_blank");
        }
    }

    const shouldShowContextMenu = () => {
        return props.showContextMenu && props.document.is_protected !== true;
    }

    return <div className={`myFilesElementContainer ${props.isClickable ? " myFilesElementContainerHoverable" : ""}`} onClick={onClickFile}>
        {shouldShowContextMenu() && <FilesElementContextMenuButton document={props.document}
            myFilesTree={props.myFilesTree}
            onMoveDeleteSuccess={props.onMoveDeleteSuccess}
            onMoveDeleteFail={props.onMoveDeleteFail} />}
        <div className="myFilesElementTitleContainer">
            <img className="myFilesElementIcon" src={iconImgSrc(props.mimeType)}></img>
            <div className="myFilesElementName">{props.document.name}</div>
        </div>
        {props.document.is_protected && <div className="myFilesElementSpecialText">PROTEGIDO</div>}
        <div className="myFilesElementSize">{sizeToHumanReadable(props.size)}</div>
    </div>
}

export default DocumentElement;