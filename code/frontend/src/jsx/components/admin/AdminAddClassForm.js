import { useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";

const AdminAddClassForm = (props) => {
    const NOT_VALID = "NOT_VALID";
    const initialGroupValue = () => {
        if (props.groups.length > 0) { return props.groups[0].tag; }
        return NOT_VALID;
    }
    const [formName, setFormName] = useState("");
    const [formGroup, setFormGroup] = useState(initialGroupValue());
    const [isLoading, setLoading] = useState(false);

    const onSubmitAddClass = (event) => {
        event.preventDefault();
        let body = {
            name: formName,
            group: formGroup
        }
        const options = {
            method: "POST",
            body: JSON.stringify(body),
            credentials: "include"
        };
        setLoading(true);
        EduAPIFetch("/api/v1/admin/classes", options)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onClassAdded();
                    setFormName("");
                } else {
                    props.onClassAdded("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onClassAdded(error.error);
                props.onDismiss();
            })
    }

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popupForm" onClick={e => { e.stopPropagation(); }}>
            <div className="card adminFormBackground">
                <div className="adminFormTitle">Nueva clase</div>
                <form onSubmit={onSubmitAddClass}>
                    <div className="formInput">
                        <input type="text" value={formName}
                            onChange={e => { setFormName(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "Literatura universal"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre</label>
                    </div>
                    <div className="formInputSelect adminAddClassSelect">
                        <select name="group"
                            value={formGroup}
                            onChange={e => { setFormGroup(e.target.value); }} >
                                {props.groups.length > 0 ?
                                props.groups.map(g => {
                                    return <option value={g.tag}>{g.tag}</option>
                                }) :
                                <option value={NOT_VALID}>-- No existen grupos. ¡Crea uno! --</option>
                            }
                        </select>
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value="Crear" disabled={formGroup === NOT_VALID} />
                    </div>
                    {isLoading && <div className="adminFormHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div> : <></>
}

export default AdminAddClassForm;