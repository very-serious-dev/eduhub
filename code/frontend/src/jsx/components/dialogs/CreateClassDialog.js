import { useContext, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import { EduAPIFetch } from "../../../client/APIFetch";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const CreateClassDialog = (props) => {
    const NOT_VALID = "NOT_VALID";
    const initialGroupValue = () => {
        if (props.groups.length > 0) { return props.groups[0].tag; }
        return NOT_VALID;
    }
    const [formName, setFormName] = useState("");
    const [formGroup, setFormGroup] = useState(initialGroupValue());
    const [isLoading, setLoading] = useState(false);
    const theme = useContext(ThemeContext);

    const onSubmitAddClass = (event) => {
        event.preventDefault();
        setLoading(true);
        let body = {
            name: formName,
            group: formGroup,
            automatically_add_teacher: props.automaticallyAddTeacher === true
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

    return <div className="popupOverlayBackground" onClick={props.onDismiss}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Nueva clase</div>
                <form onSubmit={onSubmitAddClass}>
                    <div className="formInputContainer">
                        <input type="text" value={formName}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormName(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "Gestión de la documentación jurídica y empresarial"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            maxLength={50}
                            required />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Nombre</label>
                    </div>
                    <div className="formInputSelectContainer selectWithTopMargin">
                        <select name="group"
                            value={formGroup}
                            className={`formInputSelect ${primary(theme)}`}
                            onChange={e => { setFormGroup(e.target.value); }} >
                            {props.groups.length > 0 ?
                                props.groups.map(g => {
                                    return <option value={g.tag}>{g.tag}</option>
                                }) :
                                <option value={NOT_VALID}>-- No existen grupos. ¡Crea uno! --</option>
                            }
                        </select>
                    </div>
                    <p className="createClassParticipantsHint"><i>Todos los estudiantes que están registrados en el grupo {formGroup} serán añadidos automáticamente a la nueva clase{formName.length > 0 ? ` ${formName}`: ""}.</i></p>
                    <p className="createClassParticipantsHint"><i>Puedes ajustar los participantes de{formName.length > 0 ? ` ${formName}`: ""} después.</i></p>
                    <div className="formInputContainer">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Crear" disabled={formGroup === NOT_VALID} />
                    </div>
                    {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div>
}

export default CreateClassDialog;