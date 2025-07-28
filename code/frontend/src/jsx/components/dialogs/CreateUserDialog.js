import { useContext, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import { EduAPIFetch } from "../../../client/APIFetch";
import { accent, accentFormLabel, pointableSecondary, primary } from "../../../util/Themes";
import { ThemeContext } from "../../main/GlobalContainer";

const CreateUserDialog = (props) => {
    const NOT_VALID = "NOT_VALID";
    const initialStudentGroupValue = () => {
        if (props.groups.length > 0) { return props.groups[0].tag; }
        return NOT_VALID;
    }
    const [formUsername, setFormUsername] = useState("");
    const [formName, setFormName] = useState("");
    const [formSurname, setFormSurname] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [formIsTeacher, setFormIsTeacher] = useState(undefined);
    const [formStudentGroup, setFormStudentGroup] = useState(initialStudentGroupValue());
    const [isLoading, setLoading] = useState(false);
    const [usernameDidGainFocusOnce, setUsernameDidGainFocusOnce] = useState(false);
    const theme = useContext(ThemeContext);

    const onSubmitAddUser = (event) => {
        event.preventDefault();
        setLoading(true);
        let body = {
            name: formName,
            surname: formSurname,
            username: formUsername,
            password: formPassword
        }
        if (formIsTeacher) {
            body.is_teacher = true;
        } else if (formStudentGroup !== undefined) {
            body.student_group = formStudentGroup;
        }
        EduAPIFetch("POST", "/api/v1/admin/users", body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onUserAdded();
                    setFormName("");
                    setFormSurname("");
                    setFormUsername("");
                    setFormPassword("");
                } else {
                    props.onUserAdded("Se ha producido un error");
                }
                setUsernameDidGainFocusOnce(false);
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                setUsernameDidGainFocusOnce(false);
                props.onUserAdded(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    const academicYearSuffix = () => {
        const date = new Date();
        const JULY = 6;
        if (date.getMonth() < JULY) {
            return `${date.getFullYear() - 1}`.slice(2);
        } else {
            return `${date.getFullYear()}`.slice(2);
        };
    }

    const onUsernameDidGainFocus = () => {
        if (usernameDidGainFocusOnce) { return; }
        setUsernameDidGainFocusOnce(true);
        let suggestedUsername = "";
        if (formName.length > 0) {
            suggestedUsername += formName[0].toLowerCase();
        }
        if (formSurname.length > 0) {
            const splittedSurname = formSurname.split(" ");
            const firstSurname = splittedSurname[0].toLowerCase();
            // https://stackoverflow.com/a/37511463
            suggestedUsername += firstSurname.normalize("NFD").replace(/\p{Diacritic}/gu, "");
            if (splittedSurname.length > 1) {
                const lastSurname = splittedSurname[splittedSurname.length - 1].toLocaleLowerCase();
                suggestedUsername += lastSurname[0];
            }
        }
        suggestedUsername += academicYearSuffix();
        setFormUsername(suggestedUsername);
    }

    return <div className="popupOverlayBackground"
        onClick={() => { setUsernameDidGainFocusOnce(false); props.onDismiss(); }}>
        <div className="popup" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Nuevo usuario</div>
                <form onSubmit={onSubmitAddUser}>
                    <div className="formInputContainer">
                        <input type="text" value={formName}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormName(e.target.value) }}
                            maxLength={50}
                            required />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Nombre</label>
                    </div>
                    <div className="formInputContainer">
                        <input type="text" value={formSurname}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormSurname(e.target.value) }}
                            maxLength={50}
                            required />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Apellidos</label>
                    </div>
                    <div className="formInputContainer">
                        <input type="text" value={formUsername}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormUsername(e.target.value) }}
                            onFocus={onUsernameDidGainFocus}
                            maxLength={50}
                            required />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Nombre de usuario</label>
                    </div>
                    <div className="formInputContainer">
                        <input type="text" value={formPassword}
                            className={`formInput ${primary(theme)}`}
                            onChange={e => { setFormPassword(e.target.value) }}
                            required />
                        <div className={`underline ${accent(theme)}`} />
                        <label className={`formLabel ${accentFormLabel(theme)}`} htmlFor="">Contraseña</label>
                    </div>
                    <div className="formInputRadio">
                        <input type="radio" name="rolType" value="isTeacher"
                            onChange={e => { setFormIsTeacher(e.target.value === "isTeacher"); }}
                            required />
                        <label htmlFor="">DOCENTE</label>
                    </div>
                    <div className="formInputRadio">
                        <input type="radio" name="rolType" value="isStudent"
                            onChange={e => { setFormIsTeacher(!(e.target.value === "isStudent")); }}
                            required />
                        <label htmlFor="">ESTUDIANTE</label>
                    </div>
                    <div className={"formInputSelectContainer selectWithTopMargin addUserSelect" + (formIsTeacher === undefined || formIsTeacher === true ? " formInputSelectHidden" : "")}>
                        <select name="studentGroup"
                            value={formStudentGroup}
                            className={`formInputSelect ${primary(theme)}`}
                            onChange={e => { setFormStudentGroup(e.target.value); }}>
                            {props.groups.length > 0 ?
                                props.groups.map(g => {
                                    return <option value={g.tag}>{g.tag}</option>
                                }) :
                                <option value={NOT_VALID}>-- No existen grupos. ¡Crea uno! --</option>
                            }
                        </select>
                    </div>
                    <div className="formInputContainer">
                        <input type="submit" className={`formInputSubmit pointable ${primary(theme)} ${pointableSecondary(theme)}`} value="Crear" disabled={formStudentGroup === NOT_VALID && formIsTeacher === false} />
                    </div>
                    {isLoading && <div className="loadingHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div>
}

export default CreateUserDialog;