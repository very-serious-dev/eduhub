import { useContext } from "react";
import { pointableSecondary, primary } from "../../../util/Themes";
import LoadingHUD from "../common/LoadingHUD";
import { ThemeContext } from "../../main/GlobalContainer";

const AreYouSureDialog = (props) => {
    const theme = useContext(ThemeContext);

    const yesOptionCss = () => {
        let css = `card areYouSureOption pointable ${primary(theme)} ${pointableSecondary(theme)}`;
        if (props.dialogMode == "DELETE") {
            css += " areYouSureOptionDestructive";
        } else if (props.dialogMode == "SUBMIT") {
            css += " areYouSureOptionDangerouslyConstructive";
        }
        return css;
    }

    const yesOptionText = () => {
        return (props.dialogMode == "SUBMIT") ? "⬆️ Entregar" : "❌ Eliminar";
    }

    const noOptionText = () => {
        return (props.dialogMode == "SUBMIT") ? "Volver" : "No";
    }

    return <div className="popupOverlayBackground" onClick={e => { e.stopPropagation(); props.onDismiss() }}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="areYouSureMessage">{props.warningMessage}</div>
                <div className={`card areYouSureOption pointable ${primary(theme)} ${pointableSecondary(theme)}`} onClick={props.onDismiss}>{noOptionText()}</div>
                <div className={yesOptionCss()} onClick={props.onActionConfirmed}>{yesOptionText()}</div>
                {props.isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
            </div>
        </div>
    </div>
}

export default AreYouSureDialog;