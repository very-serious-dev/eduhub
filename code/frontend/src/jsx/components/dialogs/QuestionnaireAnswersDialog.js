const QuestionnaireAnswersDialog = (props) => {

    // TODO GET questionnaires/<int:q_id>/submits/<username>

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground overflowScrollableDialog">
                <div className="dialogTitle">Respuestas</div>
            </div>
        </div>
    </div>
}

export default QuestionnaireAnswersDialog;