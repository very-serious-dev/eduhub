import { useContext, useState } from "react";
import { beautifullyDisplayDateTime } from "../../../util/Formatter";
import SetScoreDialog from "./SetScoreDialog";
import SmallAttachmentsListItem from "../common/SmallAttachmentsListItem";
import { accentForeground, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";
import QuestionnaireAnswersDialog from "./QuestionnaireAnswersDialog";

const AssignmentSubmitDialog = (props) => {
    const [popupShown, setPopupShown] = useState("NONE"); // NONE, SET_SCORE, VIEW_ANSWERS
    const theme = useContext(ThemeContext);

    return popupShown === "SET_SCORE" ?
        <SetScoreDialog assignmentId={props.assignmentId}
            username={props.author.username}
            currentScore={props.submit.score}
            onSuccess={props.onScoreChanged}
            onDismiss={() => { setPopupShown("NONE"); }} />
        : popupShown === "VIEW_ANSWERS" ?
            <QuestionnaireAnswersDialog questionnaireId={props.submit.answered_questionnaire_id}
                username={props.author.username}
                onDismiss={() => { setPopupShown("NONE") }} />
            : <div className="popupOverlayBackground" onClick={props.onDismiss}>
                <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
                    <div className="card dialogBackground overflowScrollableDialog">
                        <div className="dialogTitle">Detalles de la entrega</div>
                        <div className="assignmentSubmitDialogAuthorFullName">{`Entrega de: ${props.author.name} ${props.author.surname}`}</div>
                        <div className="assignmentSubmitDialogAuthorUsername">{`(${props.author.username})`}</div>
                        {props.submit === undefined ?
                            <div>
                                <div className="assignmentSubmitDialogDate">Fecha de entrega: ❌ No entregado </div>
                            </div>
                            :
                            <>
                                <div className="assignmentSubmitDialogDate">{`Fecha de entrega: ✔️ ${beautifullyDisplayDateTime(props.submit.submit_date)}`}</div>
                                {props.submit.answered_questionnaire_id ?
                                    <>
                                        <div className="assignmentSubmitDialogFilesTitle">Formulario entregado:</div>
                                        <div className="assignmentSubmitDialogFiles">
                                            <button onClick={() => { setPopupShown("VIEW_ANSWERS"); }} className={`assignmentViewAnswersButton pointable ${primary(theme)} ${pointableSecondary(theme)}`}>
                                                Ver respuestas
                                            </button>
                                        </div>
                                    </>
                                    : <>
                                        <div className="assignmentSubmitDialogFilesTitle">Documentos entregados:</div>
                                        {props.submit.files.length > 0 ?
                                            <div className="assignmentSubmitDialogFiles">
                                                {props.submit.files.map(f => <SmallAttachmentsListItem attachment={{...f, type: 'document'}} />)}
                                            </div>
                                            : <div className="assignmentSubmitDialogSectionContent">No se ha entregado ningún fichero</div>}
                                        <div className="assignmentSubmitDialogCommentTitle">Comentario:</div>
                                        <div className="assignmentSubmitDialogSectionContent">{props.submit.comment ?? "No se ha añadido ningún comentario"}</div>
                                    </>}
                                <div className="assignmentSubmitScoreTitle">Calificación</div>
                                {(props.submit.score !== undefined && props.submit.score !== null) ?
                                    <>
                                        <div className={`assignmentSubmitScore ${props.submit.is_score_published ? accentForeground(theme) : "scoreUnpublished"}`}>{props.submit.score}</div>
                                        {props.submit.is_score_published === false && <div className="unpublishedScoreHint">Esta puntuación no está publicada para el estudiante todavía</div>}
                                    </>
                                    : <div className="assignmentSubmitScoreNotReceived">🍂 No hay una calificación todavía</div>}
                                {props.canEditScore && <div className={`card assignmentSetScoreButton pointable ${primary(theme)} ${pointableSecondary(theme)}`} onClick={() => { setPopupShown("SET_SCORE"); }}>
                                    ➕ Editar calificación
                                </div>}
                            </>}
                    </div>
                </div>
            </div>
}

export default AssignmentSubmitDialog;