import { useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";

const AdminAddUserForm = (props) => {
    const [formUsername, setFormUsername] = useState("");
    const [formName, setFormName] = useState("");
    const [formSurname, setFormSurname] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [formIsTeacher, setFormIsTeacher] = useState(undefined);
    const [formStudentGroup, setFormStudentGroup] = useState(undefined);
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
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onUserAdded(error.error);
                props.onDismiss();
            })
    }

    const onUsernameDidGainFocus = () => {
        if (usernameDidGainFocusOnce) { return; }
        setUsernameDidGainFocusOnce(true);
        let suggestedUsername = formName.toLowerCase()
        if (formSurname.length > 0) {
            suggestedUsername += "." + formSurname.split(" ")[0].toLowerCase();
        }
        setFormUsername(suggestedUsername);
    }

    return props.show === true ? <div className="adminAddUserOverlayBackground" onClick={props.onDismiss}>
        <div className="adminAddUserForm" onClick={(e) => { e.stopPropagation(); }}>
            <div className="card adminAddUserFormBackground">
                <div className="adminAddUserTitle">Nuevo usuario</div>
                <form onSubmit={onSubmitAddUser}>
                    <div className="formInput">
                        <input type="text" value={formName}
                            onChange={(e) => { setFormName(e.target.value) }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre</label>
                    </div>
                    <div className="formInput">
                        <input type="text" value={formSurname}
                            onChange={(e) => { setFormSurname(e.target.value) }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Apellidos</label>
                    </div>
                    <div className="formInput">
                        <input type="text" value={formPassword}
                            onChange={(e) => { setFormPassword(e.target.value) }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Contraseña</label>
                    </div>
                    <div className="formInput">
                        <input type="text" value={formUsername}
                            onChange={(e) => { setFormUsername(e.target.value) }}
                            onFocus={onUsernameDidGainFocus}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre de usuario</label>
                    </div>
                    <div className="formInputRadio">
                        <input type="radio" name="rolType" value="isTeacher"
                            onChange={(e) => { setFormIsTeacher(e.target.value === "isTeacher"); }}
                            required />
                        <label htmlFor="">DOCENTE</label>
                    </div>
                    <div className="formInputRadio">
                        <input type="radio" name="rolType" value="isStudent"
                            onChange={(e) => { setFormIsTeacher(!(e.target.value === "isStudent")); }}
                            required />
                        <label htmlFor="">ESTUDIANTE</label>
                    </div>
                    <div className="formInputSelect hidableAddUserSelectContainer">
                        <select name="studentGroup" onChange={(e) => { console.log(e);setFormStudentGroup(e.target.value); }}
                            className={formIsTeacher === undefined || formIsTeacher === true ? "hidableAddUserSelectHidden" : "hidableAddUserSelectShown"}>
                            {props.groups.length > 0 ?
                                props.groups.map((g) => {
                                    return <option value={g.tag}>{g.tag}</option>
                                }) :
                                <option value="NOT_VALID">-- No existen grupos. ¡Crea uno! --</option>
                            }
                        </select>
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value="Crear" disabled={formStudentGroup === undefined && formIsTeacher === false}/>
                    </div>
                    {isLoading && <div className="adminAddUserHUDCentered"><LoadingHUD /></div>}
                </form>
            </div>
        </div>
    </div> : <></>
}

export default AdminAddUserForm;