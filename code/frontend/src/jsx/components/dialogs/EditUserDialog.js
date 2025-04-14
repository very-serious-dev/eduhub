import { useEffect, useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";
import AreYouSureDialog from "./AreYouSureDialog";

const EditUserDialog = (props) => {
    const [formName, setFormName] = useState("");
    const [formSurname, setFormSurname] = useState("");
    const [formUsername, setFormUsername] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [isLoading, setLoading] = useState(false);
    const [showAreYouSurePopup, setShowAreYouSurePopup] = useState(false);

    useEffect(() => {
        setFormName(props.user.name);
        setFormSurname(props.user.surname);
        setFormUsername(props.user.username);
    }, [props.user])

    const onSubmitEditUser = (event) => {
        event.preventDefault();
        if (isLoading) { return; }
        setLoading(true);
        let body = {
            name: formName,
            surname: formSurname,
            username: formUsername
        }
        if (formPassword.length > 0) {
            body["password"] = formPassword;
        }
        EduAPIFetch("PUT", `/api/v1/admin/users/${props.user.username}`, body)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onUserEdited();
                    setFormName("");
                    setFormSurname("");
                    setFormUsername("");
                    setFormPassword("");
                } else {
                    props.onUserEdited("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onUserEdited(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    const onDeleteUser = () => {
        if (isLoading) { return; }
        setLoading(true);
        setShowAreYouSurePopup(false);
        EduAPIFetch("DELETE", `/api/v1/admin/users/${props.user.username}`)
            .then(json => {
                setLoading(false);
                if (json.success === true) {
                    props.onUserDeleted();
                } else {
                    props.onUserDeleted("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoading(false);
                props.onUserDeleted(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    const keepPasswordHint = "Mantener la misma contraseña";

    return showAreYouSurePopup ?
        <AreYouSureDialog onActionConfirmed={onDeleteUser}
            onDismiss={() => { setShowAreYouSurePopup(false); }}
            isLoading={isLoading}
            dialogMode="DELETE"
            warningMessage={`¿Deseas eliminar este usuario? Será archivado y dejará de ser accesible. Para restablecerlo deberás contactar con un administrador`} />
        : <div className="popupOverlayBackground" onClick={props.onDismiss}>
            <div className="popup" onClick={e => { e.stopPropagation(); }}>
                <div className="card dialogBackground">
                    <div className="dialogTitle">Editar usuario</div>
                    <form onSubmit={onSubmitEditUser}>
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
                            <input type="text" value={formUsername}
                                onChange={e => { setFormUsername(e.target.value) }}
                                required />
                            <div className="underline"></div>
                            <label htmlFor="">Nombre de usuario</label>
                        </div>
                        <div className="formInput">
                            <input type="text" value={formPassword}
                                onChange={e => { setFormPassword(e.target.value) }}
                                placeholder={keepPasswordHint}
                                onFocus={e => { e.target.placeholder = "Introduce nueva contraseña..."; }}
                                onBlur={e => { e.target.placeholder = keepPasswordHint; }} />
                            <div className="underline"></div>
                            <label htmlFor="">Contraseña</label>
                        </div>
                        <div className="formSubmit">
                            <input type="submit" value="Modificar usuario" />
                        </div>
                        {isLoading && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                    </form>
                    <div className="formSecondSubmit formSecondSubmitDestructive">
                        <button onClick={() => { setShowAreYouSurePopup(true); }}>❌ Eliminar usuario</button>
                    </div>
                </div>
            </div>
        </div>
}

export default EditUserDialog;