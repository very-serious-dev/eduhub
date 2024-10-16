import { useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";

const AdminAddUserForm = (props) => {
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

    const onSubmitAddUser = (event) => {
        event.preventDefault();
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
        const options = {
            method: "POST",
            body: JSON.stringify(body),
            credentials: "include"
        };
        setLoading(true);
        EduAPIFetch("/api/v1/admin/users", options)
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

    const onUsernameDidGainFocus = () => {
        if (usernameDidGainFocusOnce) { return; }
        setUsernameDidGainFocusOnce(true);
        let suggestedUsername = formName.toLowerCase()
        if (formSurname.length > 0) {
            suggestedUsername += "." + formSurname.split(" ")[0].toLowerCase();
            suggestedUsername = suggestedUsername.replaceAll('á', 'a')
            suggestedUsername = suggestedUsername.replaceAll('é', 'e')
            suggestedUsername = suggestedUsername.replaceAll('í', 'i')
            suggestedUsername = suggestedUsername.replaceAll('ó', 'o')
            suggestedUsername = suggestedUsername.replaceAll('ú', 'u')
        }
        setFormUsername(suggestedUsername);
    }

    return props.show === true ? <div className="popupOverlayBackground"
        onClick={() => { setUsernameDidGainFocusOnce(false); props.onDismiss(); }}>
        <div className="popupForm" onClick={e => { e.stopPropagation(); }}>
            <div className="card dialogBackground">
                <div className="dialogTitle">Nuevo usuario</div>
                <form onSubmit={onSubmitAddUser}>
                    <div className="formInput">
                        <input type="text" value={formName}
                            onChange={e => { setFormName(e.target.value) }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre</label>
                    </div>
                    <div className="formInput">
                        <input type="text" value={formSurname}
                            onChange={e => { setFormSurname(e.target.value) }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Apellidos</label>
                    </div>
                    <div className="formInput">
                        <input type="text" value={formPassword}
                            onChange={e => { setFormPassword(e.target.value) }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Contraseña</label>
                    </div>
                    <div className="formInput">
                        <input type="text" value={formUsername}
                            onChange={e => { setFormUsername(e.target.value) }}
                            onFocus={onUsernameDidGainFocus}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre de usuario</label>
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
                    <div className="formInputSelect adminAddUserSelect hidableAdminFormSelectContainer">
                        <select name="studentGroup"
                            value={formStudentGroup}
                            onChange={e => { setFormStudentGroup(e.target.value); }}
                            className={formIsTeacher === undefined || formIsTeacher === true ? "hidableAdminFormSelectHidden" : "hidableAdminFormSelectShown"}>
                            {props.groups.length > 0 ?
                                props.groups.map(g => {
                                    return <option value={g.tag}>{g.tag}</option>
                                }) :
                                <option value={NOT_VALID}>-- No existen grupos. ¡Crea uno! --</option>
                            }
                        </select>
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value="Crear" disabled={formStudentGroup === NOT_VALID && formIsTeacher === false} />
                    </div>
                    {isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div> : <></>
}

export default AdminAddUserForm;