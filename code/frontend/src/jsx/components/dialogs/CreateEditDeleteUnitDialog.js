import { useContext, useEffect, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";
import AreYouSureDialog from "./AreYouSureDialog";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const CreateEditDeleteUnitDialog = (props) => {
    const [formName, setFormName] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [showAreYouSurePopup, setShowAreYouSurePopup] = useState(false);
    const theme = useContext(ThemeContext);

    useEffect(() => {
        setFormName(props.unit.name ?? "")
    }, [props.show]);

    const isEditingUnit = () => { return props.unit.id !== undefined }

    const onSubmitAddOrEditUnit = (event) => {
        if (isLoading) { return; }
        event.preventDefault();
        setLoading(true);
        const httpMethod = isEditingUnit() ? "PUT" : "POST"
        const url = isEditingUnit() ?
            `/api/v1/classes/${props.classId}/units/${props.unit.id}`
            : `/api/v1/classes/${props.classId}/units`
        EduAPIFetch(httpMethod, url, { name: formName })
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onOperationDone();
                    setFormName("");
                } else {
                    props.onOperationDone("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onOperationDone(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    const onDeleteUnit = (event) => {
        if (isLoading) { return; }
        event.preventDefault();
        setLoading(true);
        setShowAreYouSurePopup(false);
        EduAPIFetch("DELETE", `/api/v1/classes/${props.classId}/units/${props.unit.id}`)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onOperationDone();
                    setFormName("");
                } else {
                    props.onOperationDone("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onOperationDone(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return props.show === true ? showAreYouSurePopup ?
        <AreYouSureDialog onActionConfirmed={onDeleteUnit}
            onDismiss={() => { setShowAreYouSurePopup(false); }}
            isLoading={isLoading}
            dialogMode="DELETE"
            warningMessage={`¿Deseas eliminar el tema? Las publicaciones seguirán existiendo, pero ya no estarán asociadas`} />
        : <div className="popupOverlayBackground" onClick={props.onDismiss}>
            <div className="popup" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <div className="dialogTitle">{isEditingUnit() ? "Modificar tema" : "Nuevo tema"}</div>
                    <form onSubmit={onSubmitAddOrEditUnit}>
                        <div className="formInputContainer">
                            <input type="text" value={formName}
                                className={`formInput ${primary(theme)}`}
                                onChange={e => { setFormName(e.target.value) }}
                                onFocus={e => { e.target.placeholder = "Tema 1: Ecuaciones"; }}
                                onBlur={e => { e.target.placeholder = ""; }}
                                required />
                            <div className={`underline ${accent(theme)}`} />
                            <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Nombre</label>
                        </div>
                        <div className="formInputContainer">
                            <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value={isEditingUnit() ? "Modificar" : "Crear"} />
                        </div>
                        {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                    </form>
                    {isEditingUnit() && <div className="formSecondSubmit formSecondSubmitDestructive">
                        <button onClick={() => { setShowAreYouSurePopup(true); }}>❌ Eliminar tema</button>
                    </div>}
                </div>
            </div>
        </div> : <></>
}

export default CreateEditDeleteUnitDialog;