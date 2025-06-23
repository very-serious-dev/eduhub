import { useContext, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import { EduAPIFetch } from "../../../client/APIFetch";
import AreYouSureDialog from "./AreYouSureDialog";
import { ThemeContext } from "../../main/GlobalContainer";
import { accent, accentForeground, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";
import TextAreaWithLimit from "../common/TextAreaWithLimit";

const EditClassDialog = (props) => {
    const [formName, setFormName] = useState(props.name);
    const [formEvaluationCriteria, setFormEvaluationCriteria] = useState(props.evaluationCriteria ?? "");
    const [isLoading, setLoading] = useState(false);
    const [showAreYouSurePopup, setShowAreYouSurePopup] = useState(false);
    const theme = useContext(ThemeContext);

    const onSubmitEditClass = (event) => {
        event.preventDefault();
        setLoading(true);
        const requestBody = { name: formName }
        if (props.shouldShowEvaluationCriteria) {
            requestBody.evaluation_criteria = formEvaluationCriteria;
        }
        EduAPIFetch("PUT", `/api/v1/classes/${props.classId}`, requestBody)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onClassEdited();
                    setFormName("");
                } else {
                    props.onClassEdited("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onClassEdited(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    const onDeleteClass = () => {
        if (isLoading) { return; }
        setLoading(true);
        setShowAreYouSurePopup(false);
        EduAPIFetch("DELETE", `/api/v1/classes/${props.classId}`)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onClassDeleted();
                } else {
                    props.onClassDeleted("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onClassDeleted(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return showAreYouSurePopup ?
        <AreYouSureDialog onActionConfirmed={onDeleteClass}
            onDismiss={() => { setShowAreYouSurePopup(false); }}
            isLoading={isLoading}
            dialogMode="DELETE"
            warningMessage={`¿Deseas eliminar esta clase? Será archivada y dejará de ser accesible. Para restablecerla deberás contactar con un administrador`} />
        : <div className="popupOverlayBackground" onClick={props.onDismiss}>
            <div className="popup widePopup" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <div className="dialogTitle">Editar clase</div>
                    <form onSubmit={onSubmitEditClass}>
                        <div className="formInputContainer">
                            <input type="text" value={formName}
                                className={`formInput ${primary(theme)}`}
                                onChange={e => { setFormName(e.target.value) }}
                                onFocus={e => { e.target.placeholder = "Literatura universal"; }}
                                onBlur={e => { e.target.placeholder = ""; }}
                                maxLength={50}
                                required />
                            <div className={`underline ${accent(theme)}`} />
                            <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Nombre</label>
                        </div>
                        {props.shouldShowEvaluationCriteria && <>
                            <div className={`evaluationCriteriaLabel ${accentForeground(theme)}`}>Criterios de evaluación</div>
                            <TextAreaWithLimit value={formEvaluationCriteria} setValue={setFormEvaluationCriteria} maxLength={3000} small={false} />
                        </>}
                        <div className="formInputContainer">
                            <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Guardar cambios" />
                        </div>
                        {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                    </form>
                    <div className="formSecondSubmit formSecondSubmitDestructive">
                        <button onClick={() => { setShowAreYouSurePopup(true); }}>❌ Eliminar clase</button>
                    </div>
                </div>
            </div>
        </div>
}

export default EditClassDialog;