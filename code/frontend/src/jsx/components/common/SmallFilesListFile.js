import { useContext } from "react";
import { DOCU_SERVER } from "../../../client/Servers";
import { iconImgSrc, sizeToHumanReadable } from "../../../util/Formatter";
import { accentForeground, pointableSecondary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const SmallFilesListFile = (props) => {
    const theme = useContext(ThemeContext);

    const onClickFile = () => {
        window.open(`${DOCU_SERVER}/api/v1/documents/${props.file.identifier}`, "_blank")
    }

    return <div className={`smallFilesListFile pointable ${pointableSecondary(theme)}`} onClick={onClickFile}>
        <img className="smallFilesListFileImage" src={iconImgSrc(props.file.mime_type)} />
        <div className="smallFilesListFileRightContainer">
            <div className={`smallFilesListFileTitle ${accentForeground(theme)}`}>{props.file.name}</div>
            <div className={`smallFilesListFileSubtitle ${accentForeground(theme)}`}>{sizeToHumanReadable(props.file.size)}</div>
        </div>
    </div>
}

export default SmallFilesListFile;