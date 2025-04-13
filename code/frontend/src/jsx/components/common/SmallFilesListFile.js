import { DOCU_SERVER } from "../../../client/Servers";
import { iconImgSrc, sizeToHumanReadable } from "../../../util/Formatter";

const SmallFilesListFile = (props) => {

    const onClickFile = () => {
        window.open(`${DOCU_SERVER}/api/v1/documents/${props.file.identifier}`, "_blank")
    }

    return <div className="smallFilesListFile" onClick={onClickFile}>
        <img className="smallFilesListFileImage" src={iconImgSrc(props.file.mime_type)} />
        <div className="smallFilesListFileRightContainer">
            <div className="smallFilesListFileTitle">{props.file.name}</div>
            <div className="smallFilesListFileSubtitle">{sizeToHumanReadable(props.file.size)}</div>
        </div>
    </div>
}

export default SmallFilesListFile;