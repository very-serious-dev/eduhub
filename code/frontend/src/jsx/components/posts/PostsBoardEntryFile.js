import DocuURL from "../../../client/DocuURL";
import { iconImgSrc, sizeToHumanReadable } from "../../../util/Formatter";

const PostsBoardEntryFile = (props) => {

    const onClickFile = () => {
        window.open(`${DocuURL}/api/v1/documents/${props.file.identifier}`, "_blank")
    }

    return <div className="classEntryFile" onClick={onClickFile}>
        <img className="classEntryFileImage" src={iconImgSrc(props.file.mime_type)} />
        <div className="classEntryFileRightContainer">
            <div className="classEntryFileTitle">{props.file.name}</div>
            <div className="classEntryFileSubtitle">{sizeToHumanReadable(props.file.size)}</div>
        </div>
    </div>
}

export default PostsBoardEntryFile;