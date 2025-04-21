import { useContext } from "react";
import { sizeToHumanReadable } from "../../../util/Formatter";
import { accentForeground } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const DropFilesAreaItem = (props) => {
    const theme = useContext(ThemeContext);

    return <div className="dropFilesAreaItem">
        <div className={`dropFilesAreaItemTitle ${accentForeground(theme)}`}>{props.file.name}</div>
        <div className={`dropFilesAreaItemSubtitle ${accentForeground(theme)}`}>{sizeToHumanReadable(props.file.size)}</div>
        <div className="dropFilesAreaItemDeleteButton pointable" onClick={() => { props.onDelete(props.file.name) }}>❌</div>
    </div>
}

export default DropFilesAreaItem;