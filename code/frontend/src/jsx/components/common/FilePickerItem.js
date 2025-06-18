import { useContext } from "react";
import { sizeToHumanReadable } from "../../../util/Formatter";
import { accentForeground } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const FilePickerItem = (props) => {
    const theme = useContext(ThemeContext);

    return <div className="filePickerItem">
        <div className={`filePickerItemTitle ${accentForeground(theme)}`}>{props.file.name}</div>
        <div className={`filePickerItemSubtitle ${accentForeground(theme)}`}>{sizeToHumanReadable(props.file.size)}</div>
        <div className="filePickerItemDeleteButton pointable" onClick={() => { props.onDelete(props.file.name) }}>❌</div>
    </div>
}

export default FilePickerItem;