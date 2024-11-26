import { useEffect, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";

const CreateClassDialog = (props) => {
    const NOT_VALID = "NOT_VALID";
    const initialGroupValue = () => {
        if (props.groups.length > 0) { return props.groups[0].tag; }
        return NOT_VALID;
    }
    const [formName, setFormName] = useState("");
    const [formGroup, setFormGroup] = useState(initialGroupValue());
    const [isLoading, setLoading] = useState(false);

    useEffect(() => { // FIX: This ensures that formGroup isn't NOT_VALID when displayed
                      // Otherwise, the submit button would appear disabled initially
        if (formGroup === NOT_VALID) {
            setFormGroup(initialGroupValue());
        }
    }, [props.show]);

    const onSubmitAddClass = (event) => {
        event.preventDefault();
        setLoading(true);
        let body = {
            name: formName,
            group: formGroup,
            automaticallyAddTeacher: props.automaticallyAddTeacher === true
        }
        EduAPIFetch("POST", "/api/v1/classes", body)
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
                props.onClassAdded(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Nueva clase</div>
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
                    <div className="formInputSelect createClassSelect">
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
                    {isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div> : <></>
}

export default CreateClassDialog;