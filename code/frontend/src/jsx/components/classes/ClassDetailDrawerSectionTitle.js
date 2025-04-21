import { useContext } from "react";
import { accent, accentForeground } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const ClassDetailDrawerSectionTitle = (props) => {
    const theme = useContext(ThemeContext);
    
    return <>
        <div className={accentForeground(theme)}>{props.title}</div>
        <div className={`classDetailSectionUnderline ${accent(theme)}`} />
    </>
}

export default ClassDetailDrawerSectionTitle;