import { useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";
import AreYouSureDialog from "./AreYouSureDialog";

const EditClassDialog = (props) => {
    const [formName, setFormName] = useState();
    const [formColor, setFormColor] = useState();
    const [isLoading, setLoading] = useState(false);
    const [showAreYouSurePopup, setShowAreYouSurePopup] = useState(false);

    const onSubmitEditClass = (event) => {
        event.preventDefault();
        let body = {
            name: formName,
            color: formColor
        }
        const options = {
            method: "PUT",
            body: JSON.stringify(body),
            credentials: "include"
        };
        setLoading(true);
        EduAPIFetch(`/api/v1/classes/${props.classId}`, options)
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
        const options = {
            method: "DELETE",
            credentials: "include"
        };
        setLoading(true);
        setShowAreYouSurePopup(false);
        EduAPIFetch(`/api/v1/classes/${props.classId}`, options)
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
    <AreYouSureDialog onDismiss={() => { setShowAreYouSurePopup(false); props.onDismiss(); }}
        onActionConfirmed={onDeleteClass}
        isLoading={isLoading} />
    : <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popupForm" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Editar clase</div>
                <form onSubmit={onSubmitEditClass}>
                    <div className="formInput">
                        <input type="text" value={formName}
                            onChange={e => { setFormName(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "Literatura universal"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre</label>
                    </div>
                    <div className="formInput formInputColor">
                        <input type="color" value={formColor} 
                            onChange={e => { setFormColor(e.target.value) }}/>
                        <label htmlFor="">Color del tema</label>
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value="Guardar cambios" />
                    </div>
                    {isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                </form>
                <div className="buttonDelete">
                    <button onClick={ () => { setShowAreYouSurePopup(true); }}>❌ Eliminar clase</button>
                </div>
            </div>
        </div>
    </div> : <></>
}

export default EditClassDialog;