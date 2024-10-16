import { useState } from "react";
import LoadingHUD from "../common/LoadingHUD";
import EduAPIFetch from "../../../client/EduAPIFetch";

const AdminClassAddStudent = (props) => {
    const [formStudentUsername, setFormStudentUsername] = useState("");
    const [isLoadingSubmit, setLoadingSubmit] = useState(false);

    const onSubmitAddStudent = (event) => {
        event.preventDefault();
        const options = {
            method: "POST",
            body: JSON.stringify({
                username: formStudentUsername
            }),
            credentials: "include"
        };
        setLoadingSubmit(true);
        EduAPIFetch(`/api/v1/admin/classes/${props.classroom.id}/students`, options)
            .then(json => {
                setLoadingSubmit(false);
                if (json.success === true) {
                    props.onStudentAdded();
                } else if (json.partial_success === true) {
                    props.onStudentAdded(json.error);
                } else {
                    props.onStudentAdded("Se ha producido un error");
                }
                props.onDismiss();
            })
            .catch(error => {
                setLoadingSubmit(false);
                props.onStudentAdded(error.error ?? "Se ha producido un error");
                props.onDismiss();
            })
    }

    return props.show === true ? <div className="popupOverlayBackground" onClick={props.onDismiss}>
    <div className="popupForm" onClick={e => { e.stopPropagation(); }}>
        <div className="card dialogBackground">
        <div className="dialogTitle">Añadir estudiante a {props.classroom.name}</div>
                <form onSubmit={onSubmitAddStudent}>
                    <div className="formInput">
                        <input type="text" value={formStudentUsername}
                            onChange={e => { setFormStudentUsername(e.target.value) }}
                            onFocus={e => { e.target.placeholder = "pepe.depura"; }}
                            onBlur={e => { e.target.placeholder = ""; }}
                            required />
                        <div className="underline"></div>
                        <label htmlFor="">Nombre de usuario</label>
                    </div>
                    <div className="hint">Puedes añadir más de un estudiante a la vez si los introduces en una lista separados por comas</div>
                    <div className="formSubmit">
                        <input type="submit" value="Añadir" disabled={isLoadingSubmit} />
                    </div>
                    {isLoadingSubmit && <div className="dialogHUDCentered"><LoadingHUD /></div>}
                </form>
        </div>
    </div>
</div> : <></>
}

export default AdminClassAddStudent;