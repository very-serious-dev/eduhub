import { useEffect, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";
import AreYouSureDialog from "./AreYouSureDialog";

const CreateEditDeleteUnitDialog = (props) => {
    const [formName, setFormName] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [showAreYouSurePopup, setShowAreYouSurePopup] = useState(false);

    useEffect(() => {
        setFormName(props.unit.name ?? "")
    }, [props.show]);

    const isEditingUnit = () => { return props.unit.id !== undefined }

    const onSubmitAddOrEditUnit = (event) => {
        if (isLoading) { return; }
        event.preventDefault();
        const options = {
            method: isEditingUnit() ? "PUT" : "POST",
            body: JSON.stringify({
                name: formName
            }),
            credentials: "include"
        };
        setLoading(true);
        const url = isEditingUnit() ? 
                    `/api/v1/classes/${props.classId}/units/${props.unit.id}`
                    : `/api/v1/classes/${props.classId}/units`
        EduAPIFetch(url, options)
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
        const options = {
            method: "DELETE",
            credentials: "include"
        };
        setLoading(true);
        setShowAreYouSurePopup(false);
        EduAPIFetch(`/api/v1/classes/${props.classId}/units/${props.unit.id}`, options)
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
    <AreYouSureDialog onDismiss={() => { setShowAreYouSurePopup(false); props.onDismiss(); }}
        onActionConfirmed={onDeleteUnit}
        isLoading={isLoading} />
    : <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popupForm" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">{isEditingUnit() ? "Modificar tema" : "Nuevo tema"}</div>
                <form onSubmit={onSubmitAddOrEditUnit}>
                    <div className="formInput">
                        <input type="text" value={formName}
                            onChange={e => { setFormName(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "Ecuaciones"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre</label>
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value={isEditingUnit() ? "Modificar" : "Crear"} />
                    </div>
                    {isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                </form>
                { isEditingUnit() && <div className="buttonDelete">
                    <button onClick={ () => { setShowAreYouSurePopup(true); }}>❌ Eliminar tema</button>
                </div> }
            </div>
        </div>
    </div> : <></>
}

export default CreateEditDeleteUnitDialog;