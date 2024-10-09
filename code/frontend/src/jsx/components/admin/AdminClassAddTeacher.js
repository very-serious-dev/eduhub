import { useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";

const AdminClassAddTeacher = (props) => {
    const [formTeacherUsername, setFormTeacherUsername] = useState("");
    const [isLoadingSubmit, setLoadingSubmit] = useState(false);

    const onSubmitAddTeacher = (event) => {
        event.preventDefault();
        const options = {
            method: "POST",
            body: JSON.stringify({
                username: formTeacherUsername
            }),
            credentials: "include"
        };
        setLoadingSubmit(true);
        EduAPIFetch(`/api/v1/admin/classes/${props.classroom.id}/teachers`, options)
            .then(json => {
                setLoadingSubmit(false);
                if (json.success === true) {
                    props.onTeacherAdded();
                } else {
                    props.onTeacherAdded("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoadingSubmit(false);
                props.onTeacherAdded(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
    <div className="popupForm" onClick={e => { e.stopPropagation(); }}>
        <div className="card adminFormBackground">
        <div className="adminFormTitle">Añadir docente a {props.classroom.name}</div>
                <form onSubmit={onSubmitAddTeacher}>
                    <div className="formInput">
                        <input type="text" value={formTeacherUsername}
                            onChange={e => { setFormTeacherUsername(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "pepe.depura"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre de usuario</label>
                    </div>
                    <div className="formSubmit">
                        <input type="submit" value="Crear" disabled={isLoadingSubmit} />
                    </div>
                    {isLoadingSubmit && <div className="adminFormHUDCentered"><LoadingHUD /></div>}
                </form>
        </div>
    </div>
</div> : <></>
}

export default AdminClassAddTeacher;