import { useContext } from "react";
import { sizeToHumanReadable } from "../../../util/Formatter";
import { accentForeground } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const FilePickerItem = (props) => {
    const theme = useContext(ThemeContext);

    const title = props.attachment.type === "document" ? props.attachment.name : props.attachment.title;
    const subtitle = props.attachment.type === "document" ? sizeToHumanReadable(props.attachment.size) : "📝 Formulario"
    return <div className="filePickerItem">
        <div className={`filePickerItemTitle ${accentForeground(theme)}`}>{title}</div>
        <div className={`filePickerItemSubtitle ${accentForeground(theme)}`}>{subtitle}</div>
        <div className="filePickerItemDeleteButton pointable" onClick={() => { props.onDelete(props.attachment) }}>❌</div>
    </div>
}

export default FilePickerItem;