import { useContext } from "react";
import { pointableSecondary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const OptionsDialog = (props) => {
    const theme = useContext(ThemeContext);
    
    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                {props.options.map(option => {
                    return <div className={`optionsDialogChoice pointable card ${pointableSecondary(theme)}`} onClick={option.onClick}>{option.label}</div>
                })}
            </div>
        </div>
    </div> : <></>
}

export default OptionsDialog;