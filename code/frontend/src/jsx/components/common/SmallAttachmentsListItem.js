import { useContext } from "react";
import { DOCU_SERVER } from "../../../client/Servers";
import { iconImgSrc, sizeToHumanReadable } from "../../../util/Formatter";
import { accentForeground, pointableSecondary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const SmallAttachmentsListItem = (props) => {
    const theme = useContext(ThemeContext);

    const onClick = () => {
        if (props.attachment.type === "document") {
            window.open(`${DOCU_SERVER}/api/v1/documents/${props.attachment.identifier}`, "_blank")
        }
        if (props.attachment.type === "questionnaire") {
            window.open(`/questionnaires/${props.attachment.id}`, "_blank")
        }
    }

    const title = props.attachment.type === "document" ? props.attachment.name : props.attachment.title;
    const subtitle = props.attachment.type === "document" ? sizeToHumanReadable(props.attachment.size) : "📝 Formulario"
    const key = `${props.attachment.type}${title}`

    return <div key={key} className={`smallFilesListFile pointable ${pointableSecondary(theme)}`} onClick={onClick}>
        <img className="smallFilesListFileImage" src={iconImgSrc(props.attachment)} />
        <div className="smallFilesListFileRightContainer">
            <div className={`smallFilesListFileTitle ${accentForeground(theme)}`}>{title}</div>
            <div className={`smallFilesListFileSubtitle ${accentForeground(theme)}`}>{subtitle}</div>
        </div>
    </div>
}

export default SmallAttachmentsListItem;