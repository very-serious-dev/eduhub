import { useContext, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import { EduAPIFetch } from "../../../client/APIFetch";
import AreYouSureDialog from "./AreYouSureDialog";
import { ThemeContext } from "../../main/GlobalContainer";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";

const EditClassDialog = (props) => {
    const [formName, setFormName] = useState();
    const [isLoading, setLoading] = useState(false);
    const [showAreYouSurePopup, setShowAreYouSurePopup] = useState(false);
    const theme = useContext(ThemeContext);

    const onSubmitEditClass = (event) => {
        event.preventDefault();
        setLoading(true);
        EduAPIFetch("PUT", `/api/v1/classes/${props.classId}`, { name: formName })
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

    return props.show === true ? showAreYouSurePopup ?
        <AreYouSureDialog onActionConfirmed={onDeleteClass}
            onDismiss={() => { setShowAreYouSurePopup(false); }}
            isLoading={isLoading}
            dialogMode="DELETE"
            warningMessage={`¿Deseas eliminar esta clase? Será archivada y dejará de ser accesible. Para restablecerla deberás contactar con un administrador`} />
        : <div className="popupOverlayBackground" onClick={props.onDismiss}>
            <div className="popup" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <div className="dialogTitle">Editar clase</div>
                    <form onSubmit={onSubmitEditClass}>
                        <div className="formInputContainer">
                            <input type="text" value={formName}
                                className={`formInput ${primary(theme)}`}
                                onChange={e => { setFormName(e.target.value) }}
                                onFocus={e => { e.target.placeholder = "Literatura universal"; }}
                                onBlur={e => { e.target.placeholder = ""; }}
                                required />
                            <div className={`underline ${accent(theme)}`} />
                            <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Nombre</label>
                        </div>
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
        </div> : <></>
}

export default EditClassDialog;