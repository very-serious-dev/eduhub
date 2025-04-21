import { useContext, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";
import { FeedbackContext, ThemeContext } from "../../main/GlobalContainer";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";

const SetScoreDialog = (props) => {
    const [formScore, setFormScore] = useState(props.currentScore);
    const [isLoading, setLoading] = useState(false);
    const setFeedback = useContext(FeedbackContext);
    const theme = useContext(ThemeContext);

    const onSubmit = (event) => {
        event.preventDefault();
        putScore(false);
    }

    const putScore = (shouldBePublished) => {
        setLoading(true);
        const body = { score: formScore, is_published: shouldBePublished };
        EduAPIFetch("PUT", `/api/v1/assignments/${props.assignmentId}/submits/${props.username}/score`, body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    setFeedback({ type: "success", message: "Calificación modificada" });
                    props.onSuccess(json.result);
                } else {
                    setFeedback({ type: "error", message: "Se ha producido un error" });
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                setFeedback({ type: "error", message: error.error ?? "Se ha producido un error" });
                props.onDismiss();
            })
    }

    const removeScore = () => { //TODO merge with above function? This is almost the same
        setLoading(true);
        EduAPIFetch("DELETE", `/api/v1/assignments/${props.assignmentId}/submits/${props.username}/score`)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    setFeedback({ type: "success", message: "Calificación eliminada" });
                    props.onSuccess(json.result);
                } else {
                    setFeedback({ type: "error", message: "Se ha producido un error" });
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                setFeedback({ type: "error", message: error.error ?? "Se ha producido un error" });
                props.onDismiss();
            })
    }

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Editar calificación</div>
                <form onSubmit={onSubmit}>
                    <div className="formInputContainer">
                        <input type="number" value={formScore}
                            min={0}
                            max={10}
                            step={.01}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormScore(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "7.5"; }}
                            onBlur={e => { e.target.placeholder = ""; }} required />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Puntuación</label>
                    </div>
                    <div className="formInputContainer">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Guardar calificación" disabled={isLoading} />
                    </div>
                    <div className="formSecondSubmit formSecondSubmitConstructive">
                        <button disabled={isLoading} onClick={(e) => { e.preventDefault(); putScore(true); }}>Guardar y enviar al estudiante</button>
                    </div>
                    {props.currentScore !== null &&
                        <div className="formSecondSubmit formSecondSubmitDestructive">
                            <button disabled={isLoading} onClick={(e) => { e.preventDefault(); removeScore(); }}>❌ Retirar calificación</button>
                        </div>}
                    {isLoading && <div className="dialogScreenHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div>
}

export default SetScoreDialog;