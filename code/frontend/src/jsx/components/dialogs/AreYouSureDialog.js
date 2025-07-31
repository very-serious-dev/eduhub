import { useContext } from "react";
import { pointableSecondary, primary } from "../../../util/Themes";
import LoadingHUD from "../common/LoadingHUD";
import { ThemeContext } from "../../main/GlobalContainer";

const AreYouSureDialog = (props) => {
    const theme = useContext(ThemeContext);

    const yesOptionCss = () => {
        let css = `card areYouSureOption pointable ${primary(theme)} ${pointableSecondary(theme)}`;
        if ((props.dialogMode === "DELETE") || (props.dialogMode === "CONTINUE")) {
            css += " areYouSureOptionDestructive";
        } else if (props.dialogMode === "SUBMIT") {
            css += " areYouSureOptionDangerouslyConstructive";
        }
        return css;
    }

    const yesOptionText = () => {
        return (props.dialogMode == "SUBMIT") ? "⬆️ Entregar" : (props.dialogMode === "DELETE") ? "❌ Eliminar" : "📦 Continuar";
    }

    const noOptionText = () => {
        return (props.dialogMode == "DELETE") ? "No" : "Volver";
    }

    return <div className="popupOverlayBackground" onClick={e => { e.stopPropagation(); props.onDismiss() }}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="areYouSureMessage">{props.warningMessage}</div>
                <div className={`card areYouSureOption pointable ${primary(theme)} ${pointableSecondary(theme)}`} onClick={props.onDismiss}>{noOptionText()}</div>
                <div className={yesOptionCss()} onClick={props.onActionConfirmed}>{yesOptionText()}</div>
                {props.isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
            </div>
        </div>
    </div>
}

export default AreYouSureDialog;