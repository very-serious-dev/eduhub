import { formatPseudoMarkdown } from "../../../util/Formatter";

const ClassInfoDialog = (props) => {

    const content = () => {
        if (props.evaluationCriteria) {
            return formatPseudoMarkdown(props.evaluationCriteria)
        } else {
            return "No se han especificado los criterios de evaluación en la plataforma. Debes consultarlos en clase."
        }
    }

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">{props.name}</div>
                <div className="classInfoDialogContent"><b>Grupo:</b></div>
                <div className="classInfoDialogContent">{props.groupTag}</div>
                <div className="classInfoDialogContent"><b>Criterios de evaluación:</b></div>
                <div className="classInfoDialogContent">{content()}</div>
            </div>
        </div>
    </div>
}

export default ClassInfoDialog;