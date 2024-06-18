import { useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";

const AdminAddUserForm = (props) => {
    const [formUsername, setFormUsername] = useState("");
    const [formName, setFormName] = useState("");
    const [formSurname, setFormSurname] = useState("");
    const [formPassword, setFormPassword] = useState("");
    const [isLoading, setLoading] = useState(false);

    const onSubmitAddUser = (event) => {
        event.preventDefault();
        const options = {
            method: "POST",
            body: JSON.stringify({
                name: formName,
                surname: formSurname,
                username: formUsername,
                password: formPassword,
            }),
            credentials: "include"
        };
        setLoading(true);
        EduAPIFetch("/api/v1/admin/users", options)
                .then(json => {
                    setLoading(false);
                    if (json.success === true) {
                        alert("Exito")
                    } else {
                        alert("Error")
                    }
                })
                .catch(error => {
                    setLoading(false);
                    alert("Error")
                })

    }

    return props.show === true ? <div className="adminAddUserOverlayBackground" onClick={props.onDismiss}>
        <div className="adminAddUserForm" onClick={ (e) => { e.stopPropagation(); }}>
            <div className="card adminAddUserFormBackground">
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
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre de usuario</label>
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value="Crear" />
                    </div>
                    {isLoading && <div className="adminAddUserHUDCentered"><LoadingHUD /></div> }
                </form>
            </div>
        </div>
    </div> : <></>
}

export default AdminAddUserForm;